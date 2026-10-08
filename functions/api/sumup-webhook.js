// POST /api/sumup-webhook
// SumUp calls this when a checkout's status changes: { event_type, id }.
// The message itself isn't trusted — confirmOrder() asks SumUp for the real status.

import { loadOrder, confirmOrder, sumupRequest } from '../_lib/orders.js';

export async function onRequestPost(context) {
  const { env, request } = context;

  let event;
  try {
    event = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  if (event?.event_type !== 'CHECKOUT_STATUS_CHANGED' || !event.id) {
    return new Response(null, { status: 204 }); // ignore unknown events
  }

  // SumUp wants a quick reply, so do the work after responding.
  context.waitUntil((async () => {
    try {
      const checkout = await sumupRequest(env, `/checkouts/${encodeURIComponent(event.id)}`);
      const order = await loadOrder(env, checkout.checkout_reference);
      if (!order || order.checkoutId !== checkout.id) return;
      await confirmOrder(env, order);
    } catch (err) {
      console.error('Webhook error:', err.message);
    }
  })());

  return new Response(null, { status: 204 });
}
