// Shared helpers for the SumUp checkout.
// Not a route — Cloudflare only turns files that export onRequest* into URLs.
//
// Settings needed in Cloudflare Pages (Settings → Variables and Secrets / Bindings):
//   SUMUP_API_KEY        secret — SumUp API key (sandbox key for Preview, live key for Production)
//   SUMUP_MERCHANT_CODE  e.g. MNC178ZE (sandbox has its own code)
//   RESEND_API_KEY       secret — for order emails
//   ORDER_EMAIL          where new-order emails go, e.g. tim@timmarrs.co.uk
//   FROM_EMAIL           e.g. "Tim Marrs <shop@timmarrs.co.uk>"
//   ORDERS               KV namespace binding — stores orders between checkout and payment

const SANITY_QUERY_URL = 'https://i4ddie4h.api.sanity.io/v2024-01-01/data/query/production';
const SUMUP_API = 'https://api.sumup.com/v0.1';
const ORDER_TTL_SECONDS = 60 * 60 * 24 * 60; // keep orders for 60 days

// Size label (as shown on the site) → field prefix in Sanity's sizeVariants
const SIZE_FIELDS = {
  'A4': 'a4',
  'A3': 'a3',
  'A2': 'a2',
  'A1': 'a1',
  '30×30': 's30',
  '50×50': 's50',
};

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function formatPounds(pence) {
  return '£' + (pence / 100).toFixed(2);
}

export function newOrderRef() {
  const d = new Date();
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, '');
  const rand = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
  return `TM-${ymd}-${rand}`;
}

// Look up real prices in Sanity — never trust prices sent from the browser.
export async function priceItems(items) {
  const ids = [...new Set(items.map(i => i.productId))];
  const query = `*[_type == "product" && id.current in $ids]{ "id": id.current, name, price, available, hidden, sizeVariants }`;
  const url = `${SANITY_QUERY_URL}?query=${encodeURIComponent(query)}&$ids=${encodeURIComponent(JSON.stringify(ids))}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not load products');
  const products = (await res.json()).result || [];

  const lines = [];
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.hidden || product.available === false) {
      throw new UserError(`Sorry, one of the prints in your cart is no longer available. Please remove it and try again.`);
    }

    let unitPrice;
    let size = null;
    if (item.size) {
      const field = SIZE_FIELDS[item.size];
      const sv = product.sizeVariants || {};
      if (!field || !sv[`${field}Enabled`] || !sv[`${field}Price`]) {
        throw new UserError(`Sorry, ${product.name} isn't available in ${item.size} any more. Please remove it and try again.`);
      }
      unitPrice = sv[`${field}Price`];
      size = item.size;
    } else {
      unitPrice = product.price;
    }

    const quantity = Math.floor(Number(item.quantity));
    if (!Number.isFinite(unitPrice) || unitPrice <= 0 || !(quantity >= 1 && quantity <= 20)) {
      throw new UserError('Something in your cart looks wrong. Please empty your cart and try again.');
    }

    const unitPence = Math.round(unitPrice * 100);
    lines.push({
      productId: product.id,
      name: product.name,
      size,
      quantity,
      unitPence,
      linePence: unitPence * quantity,
    });
  }
  return lines;
}

export class UserError extends Error {}

export async function saveOrder(env, order) {
  await env.ORDERS.put(`order:${order.ref}`, JSON.stringify(order), { expirationTtl: ORDER_TTL_SECONDS });
}

export async function loadOrder(env, ref) {
  const raw = await env.ORDERS.get(`order:${ref}`);
  return raw ? JSON.parse(raw) : null;
}

export async function sumupRequest(env, path, options = {}) {
  const res = await fetch(`${SUMUP_API}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${env.SUMUP_API_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.error_message || data.detail || `SumUp error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// Ask SumUp for the real status of an order's payment. If it's PAID, mark the
// order paid and send the emails (once). Safe to call many times.
export async function confirmOrder(env, order) {
  if (!order.checkoutId) return order;

  if (order.status !== 'paid') {
    const checkout = await sumupRequest(env, `/checkouts/${order.checkoutId}`);
    if (checkout.checkout_reference !== order.ref) throw new Error('Checkout does not match order');

    if (checkout.status === 'PAID') {
      const paidPence = Math.round(Number(checkout.amount) * 100);
      if (paidPence !== order.totalPence || checkout.currency !== 'GBP') {
        throw new Error(`Paid amount ${checkout.amount} ${checkout.currency} does not match order ${order.ref}`);
      }
      const txn = (checkout.transactions || []).find(t => t.status === 'SUCCESSFUL') || {};
      order.status = 'paid';
      order.paidAt = new Date().toISOString();
      order.transactionCode = txn.transaction_code || null;
      await saveOrder(env, order);
    } else if (checkout.status === 'FAILED' || checkout.status === 'EXPIRED') {
      order.status = checkout.status.toLowerCase();
      await saveOrder(env, order);
    }
  }

  if (order.status === 'paid' && !order.emailed) {
    const sent = await sendOrderEmails(env, order);
    if (sent) {
      order.emailed = true;
      await saveOrder(env, order);
    }
  }
  return order;
}

// ── Emails ──

function linesTable(order) {
  const rows = order.lines.map(l => `
    <tr>
      <td style="padding:6px 12px 6px 0">${escapeHtml(l.name)}${l.size ? ` (${escapeHtml(l.size)})` : ''}</td>
      <td style="padding:6px 12px">× ${l.quantity}</td>
      <td style="padding:6px 0;text-align:right">${formatPounds(l.linePence)}</td>
    </tr>`).join('');
  return `
    <table style="border-collapse:collapse;font-size:15px">
      ${rows}
      <tr><td style="padding:6px 12px 6px 0">Postage (UK)</td><td></td><td style="padding:6px 0;text-align:right">Free</td></tr>
      <tr><td style="padding:10px 12px 6px 0;border-top:1px solid #ddd"><strong>Total</strong></td><td style="border-top:1px solid #ddd"></td>
          <td style="padding:10px 0 6px;text-align:right;border-top:1px solid #ddd"><strong>${formatPounds(order.totalPence)}</strong></td></tr>
    </table>`;
}

function addressBlock(c) {
  return [c.name, c.address1, c.address2, c.city, c.postcode, 'United Kingdom']
    .filter(Boolean).map(escapeHtml).join('<br>');
}

async function sendEmail(env, { to, subject, html, replyTo }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.FROM_EMAIL, to: [to], subject, html, reply_to: replyTo }),
  });
  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return false;
  }
  return true;
}

async function sendOrderEmails(env, order) {
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !env.ORDER_EMAIL) {
    console.error(`Order ${order.ref} paid but email settings are missing — not emailed`);
    return false;
  }
  const c = order.customer;
  const style = 'font-family:Helvetica,Arial,sans-serif;color:#171413;line-height:1.5';

  const toTim = await sendEmail(env, {
    to: env.ORDER_EMAIL,
    replyTo: c.email,
    subject: `New order ${order.ref} — ${formatPounds(order.totalPence)}`,
    html: `<div style="${style}">
      <h2 style="font-weight:500">New order ${escapeHtml(order.ref)}</h2>
      ${linesTable(order)}
      <h3 style="font-weight:500;margin-top:24px">Post to</h3>
      <p>${addressBlock(c)}</p>
      <p>Customer email: <a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a></p>
      <p style="color:#777;font-size:13px">Paid via SumUp${order.transactionCode ? ` — transaction ${escapeHtml(order.transactionCode)}` : ''}. Reply to this email to contact the customer.</p>
    </div>`,
  });

  const toCustomer = await sendEmail(env, {
    to: c.email,
    replyTo: env.ORDER_EMAIL,
    subject: `Your Tim Marrs order ${order.ref}`,
    html: `<div style="${style}">
      <h2 style="font-weight:500">Thank you for your order</h2>
      <p>Hi ${escapeHtml(c.name.split(' ')[0])}, your payment has gone through. Here's what you ordered:</p>
      ${linesTable(order)}
      <h3 style="font-weight:500;margin-top:24px">Posting to</h3>
      <p>${addressBlock(c)}</p>
      <p>Tim will be in touch when your print is on its way. If you have any questions, just reply to this email.</p>
      <p style="color:#777;font-size:13px">Order reference ${escapeHtml(order.ref)}</p>
    </div>`,
  });

  // Tim's copy is the one that matters; don't keep resending if only the customer's failed.
  if (!toCustomer) console.error(`Order ${order.ref}: customer confirmation email failed`);
  return toTim;
}
