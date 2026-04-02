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
        <img class="cart-item-image" src="${item.images[0]}" alt="${item.name}">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">£${item.price.toFixed(2)}</div>
          <button class="cart-item-remove" onclick="handleRemove('${item.id}')">Remove</button>
        </div>
        <div class="cart-right">
          <div class="cart-item-price">£${(item.price * item.quantity).toFixed(2)}</div>
          <div style="font-size:12px;color:#aaa;margin-top:4px;">Qty: ${item.quantity}</div>
        </div>
      </div>
    `).join('')}
    <div class="cart-subtotal">
      <span>Subtotal</span>
      <span>£${subtotal.toFixed(2)}</span>
    </div>
    <p class="cart-shipping-note">Free shipping to UK</p>
    <button class="btn-checkout" onclick="handleCheckout()">Checkout</button>
  `;
}

function handleRemove(productId) {
  removeFromCart(productId);
  renderCart();
}

function handleCheckout() {
  // Stripe checkout will be wired up here once Scott's Stripe account is ready
  alert('Checkout coming soon — Stripe integration pending.');
}

renderCart();
