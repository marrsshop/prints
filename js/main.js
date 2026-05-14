let allProducts = [];
let activeCategory = 'all';

// Sanity image ref → CDN URL
// Ref format: "image-abc123-800x600-jpg"
function sanityImageUrl(ref) {
  if (!ref) return '';
  // Strip "image-" prefix, replace last "-ext" with ".ext"
  const parts = ref.replace(/^image-/, '').split('-');
  const ext = parts.pop();
  return `https://cdn.sanity.io/images/k5wutx18/production/${parts.join('-')}.${ext}`;
}

async function loadProducts() {
  const query = encodeURIComponent(`*[_type == "product"] | order(_createdAt asc) {
    "id": id.current,
    name,
    category,
    price,
    available,
    hidden,
    description,
    variants[]{ size, price },
    "images": images[].asset._ref
  }`);
  const res = await fetch(`https://k5wutx18.api.sanity.io/v2024-01-01/data/query/production?query=${query}`);
  const data = await res.json();
  allProducts = data.result.map(p => ({
    ...p,
    images: (p.images || []).map(sanityImageUrl)
  }));

  // Pick a random category on each visit
  const categories = ['ceramics', 'paintings', 'collages', 'prints'];
  activeCategory = categories[Math.floor(Math.random() * categories.length)];
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.dataset.category === activeCategory) btn.classList.add('active');
  });

  renderProducts(allProducts);
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const filtered = (activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory))
    .filter(p => !p.hidden);

  grid.innerHTML = filtered.map(product => `
    <div class="product-card ${product.available ? '' : 'sold-out'}"
         onclick="showProduct('${product.id}')">
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
        <div class="product-overlay">
          <div class="product-overlay-meta">
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.available ? '£' + product.price.toFixed(2) : 'Sold Out'}</div>
          </div>
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
  document.getElementById('detail-description').innerHTML = product.description
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => `<p>${line}</p>`)
    .join('');

  // Remove any existing variant selector
  const existing = document.getElementById('detail-variants');
  if (existing) existing.remove();

  const priceEl = document.getElementById('detail-price');
  const cartBtn = document.getElementById('detail-add-to-cart');

  if (product.category === 'prints') {
    priceEl.textContent = 'from £40.00';
    cartBtn.style.display = 'block';
    cartBtn.disabled = true;
    cartBtn.style.opacity = '0.4';

    const variantEl = document.createElement('div');
    variantEl.id = 'detail-variants';
    variantEl.className = 'detail-variants';
    variantEl.innerHTML = `
      <div class="size-selector">
        <button class="size-btn" data-size="A3" data-price="40">A3 – £40</button>
        <button class="size-btn" data-size="A2" data-price="80">A2 – £80</button>
      </div>
      <div class="qty-stepper">
        <button class="qty-btn qty-minus" disabled>−</button>
        <span class="qty-value">1</span>
        <button class="qty-btn qty-plus" disabled>+</button>
      </div>
    `;
    cartBtn.before(variantEl);

    let selectedSize = null;
    let selectedPrice = null;
    let qty = 1;

    variantEl.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        variantEl.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSize = btn.dataset.size;
        selectedPrice = parseFloat(btn.dataset.price);
        priceEl.textContent = '£' + selectedPrice.toFixed(2);
        cartBtn.disabled = false;
        cartBtn.style.opacity = '1';
        variantEl.querySelector('.qty-minus').disabled = qty <= 1;
        variantEl.querySelector('.qty-plus').disabled = false;
      });
    });

    variantEl.querySelector('.qty-minus').addEventListener('click', () => {
      if (qty > 1) {
        qty--;
        variantEl.querySelector('.qty-value').textContent = qty;
        variantEl.querySelector('.qty-minus').disabled = qty <= 1;
      }
    });

    variantEl.querySelector('.qty-plus').addEventListener('click', () => {
      qty++;
      variantEl.querySelector('.qty-value').textContent = qty;
      variantEl.querySelector('.qty-minus').disabled = false;
    });

    cartBtn.onclick = () => {
      if (!selectedSize) return;
      addToCart({
        ...product,
        id: `${product.id}-${selectedSize.toLowerCase()}`,
        name: `${product.name} (${selectedSize})`,
        price: selectedPrice
      }, qty);
    };

  } else {
    priceEl.textContent = product.available ? '£' + product.price.toFixed(2) : 'Sold Out';
    cartBtn.disabled = false;
    cartBtn.style.opacity = '1';
    if (product.available) {
      cartBtn.style.display = 'block';
      cartBtn.onclick = () => addToCart(product);
    } else {
      cartBtn.style.display = 'none';
    }
  }

  panel.style.display = 'grid';
  const headerHeight = document.querySelector('header').offsetHeight;
  const gap = 32;
  const panelTop = panel.getBoundingClientRect().top + window.scrollY - headerHeight - gap;
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
    // Close any open product panel when switching category
    const panel = document.getElementById('product-detail-panel');
    if (panel) panel.style.display = 'none';
    renderProducts(allProducts);
  });
});

loadProducts();
