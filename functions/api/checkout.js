export async function onRequestPost(context) {
  const { STRIPE_SECRET_KEY } = context.env;

  try {
    const { items } = await context.request.json();

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart is empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', 'https://scottgarrettartist.com/success.html');
    params.append('cancel_url', 'https://scottgarrettartist.com/cart.html');
    params.append('shipping_address_collection[allowed_countries][0]', 'GB');

    items.forEach((item, i) => {
      params.append(`line_items[${i}][price_data][currency]`, 'gbp');
      params.append(`line_items[${i}][price_data][product_data][name]`, item.name);
      params.append(`line_items[${i}][price_data][unit_amount]`, Math.round(item.price * 100));
      params.append(`line_items[${i}][quantity]`, item.quantity);
    });

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: session.error?.message || 'Stripe error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
