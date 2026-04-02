let allProducts = [];
let activeCategory = 'all';

async function loadProducts() {
  const res = await fetch('products.json');
  allProducts = await res.json();
  renderProducts(allProducts);
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  grid.innerHTML = filtered.map(product => `
    <div class="product-card ${product.available ? '' : 'sold-out'}"
         onclick="window.location='product.html?id=${product.id}'">
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
        <div class="product-overlay">
          <div class="product-name">${product.name}</div>
          <div class="product-price">${product.available ? '£' + product.price.toFixed(2) : 'Sold Out'}</div>
        </div>
      </div>
      <div class="product-caption">
        <div class="product-name">${product.name}</div>
        <div class="product-price">${product.available ? '£' + product.price.toFixed(2) : 'Sold Out'}</div>
      </div>
    </div>
  `).join('');
}

// Filter buttons — click active filter to deselect and show all
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const isActive = btn.classList.contains('active');
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (isActive) {
      activeCategory = 'all';
    } else {
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
    }
    renderProducts(allProducts);
  });
});

loadProducts();
