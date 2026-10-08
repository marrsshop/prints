// Order confirmation page — asks the server whether SumUp says the payment went through.

async function showOrderStatus() {
  const box = document.getElementById('order-status');
  const ref = new URLSearchParams(location.search).get('ref');

  if (!ref) {
    box.innerHTML = `<p>Thank you. If you've just paid, you'll get a confirmation email shortly.</p>
      <p><a href="index.html">Continue shopping</a></p>`;
    return;
  }

  // The payment can take a few seconds to register, so check a few times.
  for (let attempt = 0; attempt < 6; attempt++) {
    let data = {};
    try {
      const res = await fetch(`/api/order-status?ref=${encodeURIComponent(ref)}`);
      data = await res.json();
    } catch (err) { /* try again */ }

    if (data.status === 'paid') {
      localStorage.removeItem('tim-cart');
      updateCartCount();
      document.querySelector('.cart-page h1').textContent = 'Order confirmed';
      box.innerHTML = `
        <p>Thank you — your payment has gone through. A confirmation email is on its way to you.</p>
        <ul class="order-lines">
          ${data.lines.map(l => `<li>${escapeHtml(l.name)}${l.size ? ` (${escapeHtml(l.size)})` : ''} × ${l.quantity}</li>`).join('')}
        </ul>
        <p class="order-total">Total paid: £${(data.totalPence / 100).toFixed(2)}</p>
        <p class="order-ref">Order reference ${escapeHtml(data.ref)}</p>
        <p><a href="index.html">Continue shopping</a></p>`;
      return;
    }

    if (data.status === 'failed' || data.status === 'expired') {
      document.querySelector('.cart-page h1').textContent = 'Payment not completed';
      box.innerHTML = `<p>The payment didn't go through, so you haven't been charged. Your cart has been kept.</p>
        <p><a href="cart.html">Back to cart</a></p>`;
      return;
    }

    if (data.status === 'not_found') break;
    await new Promise(r => setTimeout(r, 2500));
  }

  document.querySelector('.cart-page h1').textContent = 'Checking your payment';
  box.innerHTML = `<p>We haven't had confirmation of your payment yet. If you completed it, you'll get a confirmation email shortly — there's no need to pay again.</p>
    <p>If you didn't finish paying, your cart has been kept: <a href="cart.html">back to cart</a>.</p>`;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

showOrderStatus();
