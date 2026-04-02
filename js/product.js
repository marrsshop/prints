async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const res = await fetch('products.json');
  const products = await res.json();
  const product = products.find(p => p.id === id);

  if (!product) {
    document.getElementById('product-detail').innerHTML = '<p>Product not found.</p>';
    return;
  }

  document.title = `${product.name} — Scott Garrett`;

  const description = product.description.replace(/\n/g, '<br>');

  document.getElementById('product-detail').innerHTML = `
    <div>
      <a href="index.html" class="back-link">← Back to shop</a>
      <div class="product-detail-image">
        <img src="${product.images[0]}" alt="${product.name}">
      </div>
    </div>
    <div class="product-detail-info">
      <h1>${product.name}</h1>
      <div class="product-detail-price">£${product.price.toFixed(2)}</div>
      <div class="product-detail-description">${description}</div>
      ${product.available
        ? `<button class="btn-add-to-cart" onclick="handleAddToCart()">Add to Cart</button>`
        : `<div class="btn-sold-out">Sold Out</div>`
      }
    </div>
  `;

  window._currentProduct = product;
}

function handleAddToCart() {
  if (window._currentProduct) {
    addToCart(window._currentProduct);
  }
}

loadProduct();
