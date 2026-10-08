function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Older cart items (added before checkout was built) don't have productId/size — work them out.
function itemForCheckout(item) {
  const sizeFromName = (item.name.match(/\(([^)]+)\)$/) || [])[1] || null;
  const size = item.size !== undefined ? item.size : sizeFromName;
  const productId = item.productId || (size ? item.id.slice(0, -(size.length + 1)) : item.id);
  return { productId, size, quantity: item.quantity };
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-contents');

  if (cart.length === 0) {
    container.innerHTML = `
      <p class="cart-empty">Your cart is empty. <a href="index.html">Continue shopping</a>.</p>
    `;
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  container.innerHTML = `
    ${cart.map(item => `
      <div class="cart-item">
        <img class="cart-item-image" src="${escapeHtml(item.images[0])}" alt="${escapeHtml(item.name)}">
        <div>
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          <div class="cart-item-price">£${item.price.toFixed(2)}</div>
          <button class="cart-item-remove" data-id="${escapeHtml(item.id)}">Remove</button>
        </div>
        <div class="cart-right">
          <div class="cart-item-price">£${(item.price * item.quantity).toFixed(2)}</div>
          <div class="cart-item-qty">Qty: ${item.quantity}</div>
        </div>
      </div>
    `).join('')}
    <div class="cart-subtotal">
      <span>Subtotal</span>
      <span>£${subtotal.toFixed(2)}</span>
    </div>
    <p class="cart-shipping-note">Free shipping to UK</p>

    <form class="checkout-form" id="checkout-form" novalidate>
      <h2 class="checkout-heading">Delivery details</h2>
      <label class="checkout-field">
        <span>Full name</span>
        <input name="name" autocomplete="name" required>
      </label>
      <label class="checkout-field">
        <span>Email</span>
        <input name="email" type="email" autocomplete="email" required>
      </label>
      <label class="checkout-field">
        <span>Address line 1</span>
        <input name="address1" autocomplete="address-line1" required>
      </label>
      <label class="checkout-field">
        <span>Address line 2 <em>(optional)</em></span>
        <input name="address2" autocomplete="address-line2">
      </label>
      <div class="checkout-row">
        <label class="checkout-field">
          <span>Town / city</span>
          <input name="city" autocomplete="address-level2" required>
        </label>
        <label class="checkout-field">
          <span>Postcode</span>
          <input name="postcode" autocomplete="postal-code" required>
        </label>
      </div>
      <p class="checkout-note">UK delivery only. You'll pay securely by card, Apple Pay or Google Pay on the next page (powered by SumUp).</p>
      <p class="checkout-error" id="checkout-error" hidden></p>
      <button type="submit" class="btn-checkout">Continue to payment</button>
    </form>
  `;

  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => handleRemove(btn.dataset.id));
  });
  document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
}

function handleRemove(productId) {
  removeFromCart(productId);
  renderCart();
}

function showCheckoutError(message) {
  const el = document.getElementById('checkout-error');
  el.textContent = message;
  el.hidden = false;
}

async function handleCheckout(e) {
  e.preventDefault();
  const cart = getCart();
  if (cart.length === 0) return;

  const form = e.target;
  const customer = Object.fromEntries(new FormData(form));

  const missing = [...form.querySelectorAll('[required]')].find(input => !input.value.trim());
  if (missing) {
    missing.focus();
    showCheckoutError('Please fill in your name, email and delivery address.');
    return;
  }

  const btn = form.querySelector('.btn-checkout');
  btn.textContent = 'Please wait…';
  btn.disabled = true;
  document.getElementById('checkout-error').hidden = true;

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart.map(itemForCheckout), customer }),
    });
    const data = await response.json().catch(() => ({}));

    if (data.url) {
      window.location.href = data.url;
      return;
    }
    showCheckoutError(data.error || 'Something went wrong. Please try again.');
  } catch (err) {
    showCheckoutError('Something went wrong. Please check your connection and try again.');
  }
  btn.textContent = 'Continue to payment';
  btn.disabled = false;
}

renderCart();
