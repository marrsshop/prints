let allProducts = [];
let activeCategory = 'all';

async function loadProducts() {
  const res = await fetch('products.json');
  const data = await res.json();
  allProducts = data.products;
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
         onclick="showProduct('${product.id}')">
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

function showProduct(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const panel = document.getElementById('product-detail-panel');
  document.getElementById('detail-img').src = product.images[0];
  document.getElementById('detail-img').alt = product.name;
  document.getElementById('detail-name').textContent = product.name;
  document.getElementById('detail-price').textContent = product.available ? '£' + product.price.toFixed(2) : 'Sold Out';
  document.getElementById('detail-description').innerHTML = product.description.replace(/\n/g, '<br>');

  const cartBtn = document.getElementById('detail-add-to-cart');
  if (product.available) {
    cartBtn.style.display = 'block';
    cartBtn.onclick = () => addToCart(product);
  } else {
    cartBtn.style.display = 'none';
  }

  panel.style.display = 'grid';
  const headerHeight = document.querySelector('header').offsetHeight;
  const panelTop = panel.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top: panelTop, behavior: 'smooth' });
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
