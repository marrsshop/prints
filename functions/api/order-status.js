// GET /api/order-status?ref=TM-...
// Used by success.html to show whether the payment went through.
// Only returns the order status and items — never the customer's address.

import { json, loadOrder, confirmOrder } from '../_lib/orders.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const ref = new URL(request.url).searchParams.get('ref') || '';

  if (!/^TM-\d{6}-[A-Z0-9]{6}$/.test(ref) || !env.ORDERS) {
    return json({ status: 'not_found' }, 404);
  }

  let order = await loadOrder(env, ref);
  if (!order) return json({ status: 'not_found' }, 404);

  try {
    order = await confirmOrder(env, order);
  } catch (err) {
    console.error('Order status error:', err.message);
  }

  return json({
    ref: order.ref,
    status: order.status, // pending | paid | failed | expired
    totalPence: order.totalPence,
    lines: order.lines.map(l => ({ name: l.name, size: l.size, quantity: l.quantity })),
  });
}
