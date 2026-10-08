// POST /api/checkout
// Body: { items: [{ productId, size, quantity }], customer: { name, email, address1, address2, city, postcode } }
// Prices are looked up in Sanity here, saved as an order, and a SumUp hosted checkout is created.
// Returns { url } — the SumUp payment page to send the customer to.

import { json, priceItems, newOrderRef, saveOrder, sumupRequest, UserError } from '../_lib/orders.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

function cleanCustomer(c = {}) {
  const field = (v, max = 100) => String(v ?? '').trim().slice(0, max);
  const customer = {
    name: field(c.name),
    email: field(c.email, 200).toLowerCase(),
    address1: field(c.address1),
    address2: field(c.address2),
    city: field(c.city),
    postcode: field(c.postcode, 10).toUpperCase(),
  };
  if (!customer.name || !customer.address1 || !customer.city) {
    throw new UserError('Please fill in your name and delivery address.');
  }
  if (!EMAIL_RE.test(customer.email)) throw new UserError('Please check your email address.');
  if (!UK_POSTCODE_RE.test(customer.postcode)) throw new UserError('Please enter a valid UK postcode.');
  return customer;
}

export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.SUMUP_API_KEY || !env.SUMUP_MERCHANT_CODE || !env.ORDERS) {
    return json({ error: "Checkout isn't switched on yet. Please try again soon." }, 503);
  }

  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
    if (items.length === 0) throw new UserError('Your cart is empty.');

    const customer = cleanCustomer(body.customer);
    const lines = await priceItems(items);
    const totalPence = lines.reduce((sum, l) => sum + l.linePence, 0);

    const origin = new URL(request.url).origin;
    const ref = newOrderRef();
    const order = {
      ref,
      status: 'pending',
      createdAt: new Date().toISOString(),
      customer,
      lines,
      totalPence,
      checkoutId: null,
      emailed: false,
    };
    await saveOrder(env, order);

    const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
    const checkout = await sumupRequest(env, '/checkouts', {
      method: 'POST',
      body: JSON.stringify({
        checkout_reference: ref,
        amount: totalPence / 100,
        currency: 'GBP',
        merchant_code: env.SUMUP_MERCHANT_CODE,
        description: `Tim Marrs prints — ${itemCount} item${itemCount === 1 ? '' : 's'} — ${ref}`,
        redirect_url: `${origin}/success.html?ref=${ref}`,
        return_url: `${origin}/api/sumup-webhook`,
        hosted_checkout: { enabled: true },
      }),
    });

    if (!checkout.hosted_checkout_url) throw new Error('SumUp did not return a payment page');

    order.checkoutId = checkout.id;
    await saveOrder(env, order);

    return json({ url: checkout.hosted_checkout_url, ref });

  } catch (err) {
    if (err instanceof UserError) return json({ error: err.message }, 400);
    console.error('Checkout error:', err.message);
    return json({ error: 'Sorry, something went wrong starting the payment. Please try again.' }, 500);
  }
}
