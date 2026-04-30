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
          <div class="cart-item-qty">Qty: ${item.quantity}</div>
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

async function handleCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;

  const btn = document.querySelector('.btn-checkout');
  btn.textContent = 'Processing...';
  btn.disabled = true;

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Something went wrong. Please try again.');
      btn.textContent = 'Checkout';
      btn.disabled = false;
    }
  } catch (err) {
    alert('Something went wrong. Please try again.');
    btn.textContent = 'Checkout';
    btn.disabled = false;
  }
}

renderCart();
