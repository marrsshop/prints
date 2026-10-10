let allProducts = [];

// Always open the shop at the top on refresh, so the first row's reveal is seen in full.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

async function loadProducts() {
  const query = encodeURIComponent(`*[_type == "product"] | order(orderRank asc) {
    "id": id.current,
    name,
    price,
    available,
    hidden,
    description,
    sizeVariants,
    "images": images[].asset._ref
  }`);
  const res = await fetch(`https://i4ddie4h.api.sanity.io/v2024-01-01/data/query/production?query=${query}`);
  const data = await res.json();
  allProducts = data.result.map(p => ({
    ...p,
    images: (p.images || []).map(sanityImageUrl)
  }));
  renderProducts(allProducts);
}

function sanityImageUrl(ref) {
  if (!ref) return '';
  const parts = ref.replace(/^image-/, '').split('-');
  const ext = parts.pop();
  return `https://cdn.sanity.io/images/i4ddie4h/production/${parts.join('-')}.${ext}`;
}

// Sanity image URLs end in the image's size, e.g. "...-598x846.jpg". Giving the <img>
// that width/height lets the browser reserve the right space before the image loads.
function imageSizeAttrs(url) {
  const m = /-(\d+)x(\d+)\.\w+$/.exec(url || '');
  return m ? `width="${m[1]}" height="${m[2]}"` : '';
}

function displayPrice(product) {
  if (!product.available) return 'Sold Out';
  const sv = product.sizeVariants || {};
  const prices = [
    sv.a4Enabled && sv.a4Price,
    sv.a3Enabled && sv.a3Price,
    sv.a2Enabled && sv.a2Price,
    sv.a1Enabled && sv.a1Price,
    sv.s30Enabled && sv.s30Price,
    sv.s50Enabled && sv.s50Price,
  ].filter(Boolean);
  if (prices.length >= 1) return '£' + Math.min(...prices);
  return product.price ? '£' + product.price : '';
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const visible = products.filter(p => !p.hidden);

  grid.innerHTML = visible.map(product => `
    <div class="product-card ${product.available ? '' : 'sold-out'}"
         onclick="showProduct('${product.id}')">
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy" ${imageSizeAttrs(product.images[0])}>
        <div class="product-overlay">
          <div class="product-overlay-meta">
            <div class="product-name">${product.name}</div>
            <div class="product-price">${displayPrice(product)}</div>
          </div>
        </div>
      </div>
      <div class="product-caption">
        <div class="product-name">${product.name}</div>
        <div class="product-price">${displayPrice(product)}</div>
      </div>
    </div>
  `).join('');

  revealOnScroll(grid.querySelectorAll('.product-card'));
}

// Fade each card up as it scrolls into view (once). Without IntersectionObserver
// the cards simply show as normal.
function revealOnScroll(cards) {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      // Reveal the whole row together (cards sharing the same top edge).
      const top = entry.target.offsetTop;
      cards.forEach(card => {
        if (card.offsetTop !== top || card.classList.contains('is-in')) return;
        card.classList.add('is-in');
        observer.unobserve(card);
      });
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -12% 0px' }); // wait until a card is a little way up the screen
  // Cards already have their final size (see imageSizeAttrs), so they can be watched straight away.
  cards.forEach(card => {
    card.classList.add('reveal');
    observer.observe(card);
  });
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
  document.getElementById('detail-description').innerHTML = (product.description || '')
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => `<p>${line}</p>`)
    .join('');

  const existing = document.getElementById('detail-variants');
  if (existing) existing.remove();

  const priceEl = document.getElementById('detail-price');
  const cartBtn = document.getElementById('detail-add-to-cart');

  const sv = product.sizeVariants || {};
  const sizes = [
    { size: 'A4',   enabled: sv.a4Enabled,  price: sv.a4Price  },
    { size: 'A3',   enabled: sv.a3Enabled,  price: sv.a3Price  },
    { size: 'A2',   enabled: sv.a2Enabled,  price: sv.a2Price  },
    { size: 'A1',   enabled: sv.a1Enabled,  price: sv.a1Price  },
    { size: '30×30', enabled: sv.s30Enabled, price: sv.s30Price },
    { size: '50×50', enabled: sv.s50Enabled, price: sv.s50Price },
  ].filter(s => s.enabled && s.price);

  if (sizes.length > 0) {
    const minPrice = Math.min(...sizes.map(s => s.price));
    priceEl.textContent = `£${minPrice}`;
    cartBtn.style.display = 'block';
    cartBtn.disabled = true;
    cartBtn.style.opacity = '0.4';

    const sizeButtons = sizes.map(s =>
      `<button class="size-btn" data-size="${s.size}" data-price="${s.price}">${s.size} – £${s.price}</button>`
    ).join('');

    const variantEl = document.createElement('div');
    variantEl.id = 'detail-variants';
    variantEl.className = 'detail-variants';
    variantEl.innerHTML = `
      <div class="size-selector">${sizeButtons}</div>
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
        priceEl.textContent = '£' + selectedPrice;
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
        productId: product.id,
        size: selectedSize,
        name: `${product.name} (${selectedSize})`,
        price: selectedPrice
      }, qty);
    };

  } else {
    priceEl.textContent = product.available ? '£' + product.price : 'Sold Out';
    cartBtn.disabled = false;
    cartBtn.style.opacity = '1';
    if (product.available) {
      cartBtn.style.display = 'block';
      cartBtn.onclick = () => addToCart({ ...product, productId: product.id, size: null });
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

loadProducts();
