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

let carouselIndex = 0;
let carouselImages = [];

function buildCarousel(images, altText) {
  const track = document.getElementById('carousel-track');
  const dotsContainer = document.getElementById('carousel-dots');
  carouselImages = images;
  carouselIndex = 0;

  track.innerHTML = images.map(src =>
    `<img src="${src}" alt="${altText}" loading="lazy">`
  ).join('');

  dotsContainer.innerHTML = images.length > 1
    ? images.map((_, i) => `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Image ${i+1}"></button>`).join('')
    : '';

  dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
    dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.i)));
  });

  updateCarouselState();
}

function goToSlide(index) {
  carouselIndex = index;
  updateCarouselState();
}

function updateCarouselState() {
  const track = document.getElementById('carousel-track');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  track.style.transform = `translateX(-${carouselIndex * 100}%)`;

  dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === carouselIndex);
  });

  prevBtn.classList.toggle('hidden', carouselIndex === 0);
  nextBtn.classList.toggle('hidden', carouselIndex === carouselImages.length - 1);
}

document.getElementById('carousel-prev').addEventListener('click', () => {
  if (carouselIndex > 0) goToSlide(carouselIndex - 1);
});
document.getElementById('carousel-next').addEventListener('click', () => {
  if (carouselIndex < carouselImages.length - 1) goToSlide(carouselIndex + 1);
});

// Touch/swipe support
(function() {
  const carousel = document.getElementById('detail-carousel');
  let startX = 0;
  carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && carouselIndex < carouselImages.length - 1) goToSlide(carouselIndex + 1);
      if (diff < 0 && carouselIndex > 0) goToSlide(carouselIndex - 1);
    }
  }, { passive: true });
})();

function showProduct(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const panel = document.getElementById('product-detail-panel');
  buildCarousel(product.images, product.name);
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
