// =======================================================
// STATE (cart & favorites persisted in localStorage so they
// survive navigation between index.html / about.html / contact.html.
// Language state & t()/currentLang come from i18n.js, loaded first.)
// =======================================================
function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* ignore quota / privacy-mode errors */
  }
}

const state = {
  cart: loadStorage('mesir_cart', []),
  favorites: loadStorage('mesir_favorites', []),
  searchQuery: '',
  filters: {
    brands: [],
    sizes: [],
    countries: [],
    priceRange: [50, 600],
    availability: 'all',
  },
  hoveredProductId: null,
  heroCurrent: 0,
  heroTransitioning: false,
  currentPage: 1,
};

function persistCart() {
  saveStorage('mesir_cart', state.cart);
}
function persistFavorites() {
  saveStorage('mesir_favorites', state.favorites);
}

// Called by i18n.js (setLanguage) whenever the user switches language,
// so every dynamically-built piece of the page re-renders in the new
// language without losing any state (cart, favorites, filters...).
function onLanguageChange() {
  if (typeof renderSidebars === 'function') renderSidebars();
  if (typeof renderProductGridInternal === 'function') renderProductGridInternal();
  if (typeof renderHeroContent === 'function') renderHeroContent();
  renderCart();
  renderFavoritesPanel();
}

// =======================================================
// HEADER (present on every page)
// =======================================================
const siteHeader = document.getElementById('site-header');
const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const menuIconOpen = document.getElementById('menu-icon-open');
const menuIconClose = document.getElementById('menu-icon-close');
const cartBtn = document.getElementById('cart-btn');
const favBtn = document.getElementById('fav-btn');

if (siteHeader) {
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  });
}

let searchOpen = false;
if (searchToggle && searchBar) {
  searchToggle.addEventListener('click', () => {
    searchOpen = !searchOpen;
    searchBar.classList.toggle('hidden', !searchOpen);
    searchToggle.classList.toggle('active', searchOpen);
    if (searchOpen && searchInput) {
      searchInput.focus();
    }
  });
}

let menuOpen = false;
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('hidden', !menuOpen);
    if (menuIconOpen) menuIconOpen.style.display = menuOpen ? 'none' : 'block';
    if (menuIconClose) menuIconClose.style.display = menuOpen ? 'block' : 'none';
  });

  mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.add('hidden');
      if (menuIconOpen) menuIconOpen.style.display = 'block';
      if (menuIconClose) menuIconClose.style.display = 'none';
    });
  });
}

// ---- SEARCH (filters the catalog if it exists on this page;
//      otherwise, on About/Contact, Enter jumps back to the catalog) ----
if (searchInput) {
  searchInput.addEventListener('input', e => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    state.currentPage = 1;
    if (document.getElementById('product-grid') && window.renderProductGrid) {
      window.renderProductGrid();
    }
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (document.getElementById('catalog')) {
        document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = 'index.html#catalog';
      }
    }
  });
}

// =======================================================
// HERO SLIDER (home page only)
// =======================================================
const heroText = document.getElementById('hero-text');
const heroImageWrap = document.getElementById('hero-image-wrap');
let renderHeroContent; // exposed to onLanguageChange()
let initHero; // called once data is loaded

if (heroText && heroImageWrap) {
  const heroBrand = document.getElementById('hero-brand');
  const heroName = document.getElementById('hero-name');
  const heroTagline = document.getElementById('hero-tagline');
  const heroDescription = document.getElementById('hero-description');
  const heroNotes = document.getElementById('hero-notes');
  const heroPrice = document.getElementById('hero-price');
  const heroImage = document.getElementById('hero-image');
  const heroCurrentEl = document.getElementById('hero-current');
  const heroTotalEl = document.getElementById('hero-total');
  const heroDotsEl = document.getElementById('hero-dots');
  const heroPrevBtn = document.getElementById('hero-prev');
  const heroNextBtn = document.getElementById('hero-next');

  const pad = n => (n < 10 ? '0' + n : '' + n);

  const renderHeroDots = () => {
    heroDotsEl.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === state.heroCurrent ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      heroDotsEl.appendChild(dot);
    });
  };

  renderHeroContent = function renderHeroContent() {
    const slide = slides[state.heroCurrent];
    heroBrand.textContent = slide.brand;
    heroName.textContent = slide.name;
    heroTagline.textContent = slide.tagline[currentLang] || slide.tagline.en;
    heroDescription.textContent = slide.description[currentLang] || slide.description.en;
    heroPrice.textContent = slide.price;
    heroImage.src = slide.image;
    heroImage.alt = slide.name;

    heroNotes.innerHTML = '';
    const notesList = slide.notes[currentLang] || slide.notes.en;
    notesList.forEach(note => {
      const row = document.createElement('div');
      row.className = 'hero-note-item';
      const dot = document.createElement('div');
      dot.className = 'hero-note-dot';
      row.appendChild(dot);
      row.appendChild(document.createTextNode(note));
      heroNotes.appendChild(row);
    });

    heroCurrentEl.textContent = pad(state.heroCurrent + 1);
    heroTotalEl.textContent = pad(slides.length);
    renderHeroDots();
  };

  function goToSlide(index) {
    if (state.heroTransitioning) return;
    state.heroTransitioning = true;

    const dir = index > state.heroCurrent || (state.heroCurrent === slides.length - 1 && index === 0) ? 'next' : 'prev';
    heroText.classList.add(dir === 'next' ? 'fading' : 'fading-prev');
    heroImageWrap.classList.add('fading');

    setTimeout(() => {
      state.heroCurrent = index;
      renderHeroContent();
      heroText.classList.remove('fading', 'fading-prev');
      heroImageWrap.classList.remove('fading');
      state.heroTransitioning = false;
    }, 500);
  }

  const nextSlide = () => goToSlide((state.heroCurrent + 1) % slides.length);
  const prevSlide = () => goToSlide((state.heroCurrent - 1 + slides.length) % slides.length);

  if (heroNextBtn) heroNextBtn.addEventListener('click', nextSlide);
  if (heroPrevBtn) heroPrevBtn.addEventListener('click', prevSlide);

  initHero = function initHero() {
    renderHeroContent();
    setInterval(nextSlide, 6000);
  };
}

// =======================================================
// CATALOG (home page only) — everything below is guarded by
// the presence of #product-grid so it never runs on other pages.
// =======================================================
const productGrid = document.getElementById('product-grid');
let renderSidebars, renderProductGridInternal; // exposed to onLanguageChange()

if (productGrid) {
  const noResultsEl = document.getElementById('no-results');
  const noResultsClearBtn = document.getElementById('no-results-clear');
  const desktopItemCount = document.getElementById('desktop-item-count');
  const mobileItemCount = document.getElementById('mobile-item-count');
  const mobileFiltersToggle = document.getElementById('mobile-filters-toggle');
  const mobileFilterDrawer = document.getElementById('mobile-filter-drawer');
  const paginationEl = document.getElementById('pagination');
  const paginationNumbers = document.getElementById('pagination-numbers');
  const paginationPrevBtn = document.getElementById('pagination-prev');
  const paginationNextBtn = document.getElementById('pagination-next');
  const PRODUCTS_PER_PAGE = 9;

  let mobileFiltersOpen = false;
  if (mobileFiltersToggle && mobileFilterDrawer) {
    mobileFiltersToggle.addEventListener('click', () => {
      mobileFiltersOpen = !mobileFiltersOpen;
      mobileFilterDrawer.classList.toggle('hidden', !mobileFiltersOpen);
    });
  }

  // ---------- sidebar (checkbox / pill / radio sections that DO need a full rebuild) ----------
  function buildSidebarContent(container) {
    if (!container) return;
    container.innerHTML = '';

    const titleBlock = document.createElement('div');
    titleBlock.className = 'sidebar-title-block';
    titleBlock.innerHTML = `<h2>${t('filters_title')}</h2><div class="sidebar-title-underline"></div>`;
    container.appendChild(titleBlock);

    container.appendChild(buildCheckboxSection(t('filter_brand'), brands, state.filters.brands, toggleBrand));
    container.appendChild(buildSizeSection());
    container.appendChild(buildPriceSection());
    container.appendChild(
      buildCheckboxSection(
        t('filter_country'),
        countries,
        state.filters.countries,
        toggleCountry,
        c => (countryLabels[currentLang] && countryLabels[currentLang][c]) || c
      )
    );
    container.appendChild(buildAvailabilitySection());

    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-filters-btn';
    clearBtn.textContent = t('clear_filters');
    clearBtn.addEventListener('click', clearFilters);
    container.appendChild(clearBtn);
  }

  function buildCheckboxSection(title, items, selectedArr, toggleFn, labelFn) {
    const section = document.createElement('div');
    section.className = 'filter-section';

    const heading = document.createElement('h3');
    heading.className = 'filter-section-title';
    heading.textContent = title;
    section.appendChild(heading);

    const itemsWrap = document.createElement('div');
    itemsWrap.className = 'filter-section-items';

    items.forEach(item => {
      const checked = selectedArr.includes(item);
      const row = document.createElement('label');
      row.className = 'checkbox-row';

      const box = document.createElement('div');
      box.className = 'checkbox-box' + (checked ? ' checked' : '');
      if (checked) {
        box.innerHTML = `<svg width="8" height="8" fill="none" stroke="#390000" stroke-width="2.5" viewBox="0 0 10 10"><polyline points="2 5 4.5 7.5 8.5 2.5"></polyline></svg>`;
      }

      const label = document.createElement('span');
      label.className = 'checkbox-label' + (checked ? ' checked' : '');
      label.textContent = labelFn ? labelFn(item) : item;

      row.appendChild(box);
      row.appendChild(label);
      row.addEventListener('click', () => toggleFn(item));

      itemsWrap.appendChild(row);
    });

    section.appendChild(itemsWrap);
    return section;
  }

  function buildSizeSection() {
    const section = document.createElement('div');
    section.className = 'filter-section';

    const heading = document.createElement('h3');
    heading.className = 'filter-section-title';
    heading.textContent = t('filter_size');
    section.appendChild(heading);

    const row = document.createElement('div');
    row.className = 'size-pill-row';

    sizes.forEach(s => {
      const active = state.filters.sizes.includes(s);
      const pill = document.createElement('button');
      pill.className = 'size-pill' + (active ? ' active' : '');
      pill.textContent = s;
      pill.addEventListener('click', () => toggleSize(s));
      row.appendChild(pill);
    });

    section.appendChild(row);
    return section;
  }

  // ---------- price range: two independent sliders, updated WITHOUT
  // rebuilding the DOM on every drag tick (rebuilding mid-drag destroys
  // the input the browser is actively tracking, breaking dragging). ----------
  function buildPriceSection() {
    const section = document.createElement('div');
    section.className = 'filter-section';

    const heading = document.createElement('h3');
    heading.className = 'filter-section-title';
    heading.textContent = t('filter_price');
    section.appendChild(heading);

    const values = document.createElement('div');
    values.className = 'price-range-values';
    values.innerHTML = `<span class="price-label-min">$${state.filters.priceRange[0]}</span><span class="price-label-max">$${state.filters.priceRange[1]}</span>`;
    section.appendChild(values);

    const track = document.createElement('div');
    track.className = 'price-slider-track-wrap';

    const trackBg = document.createElement('div');
    trackBg.className = 'price-slider-track-bg';
    const trackFill = document.createElement('div');
    trackFill.className = 'price-slider-track-fill';
    track.appendChild(trackBg);
    track.appendChild(trackFill);
    section.appendChild(track);

    const inputsWrap = document.createElement('div');
    inputsWrap.className = 'price-range-inputs';

    const minInput = document.createElement('input');
    minInput.type = 'range';
    minInput.min = 50;
    minInput.max = 600;
    minInput.step = 10;
    minInput.className = 'price-min-input';
    minInput.value = state.filters.priceRange[0];

    const maxInput = document.createElement('input');
    maxInput.type = 'range';
    maxInput.min = 50;
    maxInput.max = 600;
    maxInput.step = 10;
    maxInput.className = 'price-max-input';
    maxInput.value = state.filters.priceRange[1];

    minInput.addEventListener('input', e => {
      const val = Math.min(+e.target.value, state.filters.priceRange[1] - 10);
      e.target.value = val;
      state.filters.priceRange[0] = val;
      state.currentPage = 1;
      syncPriceUI();
      renderProductGridInternal();
    });

    maxInput.addEventListener('input', e => {
      const val = Math.max(+e.target.value, state.filters.priceRange[0] + 10);
      e.target.value = val;
      state.filters.priceRange[1] = val;
      state.currentPage = 1;
      syncPriceUI();
      renderProductGridInternal();
    });

    inputsWrap.appendChild(minInput);
    inputsWrap.appendChild(maxInput);
    section.appendChild(inputsWrap);
    return section;
  }

  // Updates every rendered copy of the price slider (desktop + mobile
  // drawer) in place — no innerHTML rebuild, so an in-progress drag
  // is never interrupted.
  function syncPriceUI() {
    const [min, max] = state.filters.priceRange;
    document.querySelectorAll('.price-min-input').forEach(inp => { if (+inp.value !== min) inp.value = min; });
    document.querySelectorAll('.price-max-input').forEach(inp => { if (+inp.value !== max) inp.value = max; });
    document.querySelectorAll('.price-label-min').forEach(el => { el.textContent = `$${min}`; });
    document.querySelectorAll('.price-label-max').forEach(el => { el.textContent = `$${max}`; });

    const RANGE_MIN = 50, RANGE_MAX = 600;
    const leftPct = ((min - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100;
    const rightPct = ((max - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100;
    document.querySelectorAll('.price-slider-track-fill').forEach(el => {
      el.style.left = leftPct + '%';
      el.style.width = (rightPct - leftPct) + '%';
    });
  }

  function buildAvailabilitySection() {
    const section = document.createElement('div');
    section.className = 'filter-section';

    const heading = document.createElement('h3');
    heading.className = 'filter-section-title';
    heading.textContent = t('filter_availability');
    section.appendChild(heading);

    const itemsWrap = document.createElement('div');
    itemsWrap.className = 'filter-section-items';

    const options = [
      { key: 'all', label: t('avail_all') },
      { key: 'in-stock', label: t('avail_in_stock') },
      { key: 'made-to-order', label: t('avail_made_to_order') },
    ];

    options.forEach(opt => {
      const active = state.filters.availability === opt.key;
      const row = document.createElement('label');
      row.className = 'radio-row';

      const dot = document.createElement('div');
      dot.className = 'radio-dot' + (active ? ' active' : '');

      const label = document.createElement('span');
      label.className = 'radio-label' + (active ? ' active' : '');
      label.textContent = opt.label;

      row.appendChild(dot);
      row.appendChild(label);
      row.addEventListener('click', () => {
        state.filters.availability = opt.key;
        state.currentPage = 1;
        renderSidebars();
        renderProductGridInternal();
      });

      itemsWrap.appendChild(row);
    });

    section.appendChild(itemsWrap);
    return section;
  }

  function toggleBrand(b) {
    const arr = state.filters.brands;
    const idx = arr.indexOf(b);
    if (idx > -1) arr.splice(idx, 1); else arr.push(b);
    state.currentPage = 1;
    renderSidebars();
    renderProductGridInternal();
  }

  function toggleSize(s) {
    const arr = state.filters.sizes;
    const idx = arr.indexOf(s);
    if (idx > -1) arr.splice(idx, 1); else arr.push(s);
    state.currentPage = 1;
    renderSidebars();
    renderProductGridInternal();
  }

  function toggleCountry(c) {
    const arr = state.filters.countries;
    const idx = arr.indexOf(c);
    if (idx > -1) arr.splice(idx, 1); else arr.push(c);
    state.currentPage = 1;
    renderSidebars();
    renderProductGridInternal();
  }

  function clearFilters() {
    state.currentPage = 1;
    state.filters.brands = [];
    state.filters.sizes = [];
    state.filters.countries = [];
    state.filters.priceRange = [50, 600];
    state.filters.availability = 'all';
    state.searchQuery = '';
    if (searchInput) searchInput.value = '';
    renderSidebars();
    renderProductGridInternal();
  }

  renderSidebars = function renderSidebars() {
    buildSidebarContent(document.querySelector('[data-sidebar-target="desktop"]'));
    buildSidebarContent(document.querySelector('[data-sidebar-target="mobile"]'));
    syncPriceUI();
  };

  if (noResultsClearBtn) noResultsClearBtn.addEventListener('click', clearFilters);

  function getFilteredProducts() {
    return products.filter(p => {
      const f = state.filters;
      if (f.brands.length && !f.brands.includes(p.brand)) return false;
      if (f.sizes.length && !f.sizes.includes(p.size)) return false;
      if (f.countries.length && !f.countries.includes(p.country)) return false;
      if (p.price < f.priceRange[0] || p.price > f.priceRange[1]) return false;
      if (f.availability !== 'all' && p.availability !== f.availability) return false;
      if (state.searchQuery) {
        const q = state.searchQuery;
        const haystack = `${p.brand} ${p.name}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  function buildProductCard(product) {
    const isFav = state.favorites.includes(product.id);
    const isHovered = state.hoveredProductId === product.id;
    const description = product.description[currentLang] || product.description.en;
    const notes = product.notes[currentLang] || product.notes.en;

    const card = document.createElement('div');
    card.className = 'product-card' + (isHovered ? ' hovered' : '');
    card.addEventListener('mouseenter', () => {
      state.hoveredProductId = product.id;
      card.classList.add('hovered');
    });
    card.addEventListener('mouseleave', () => {
      if (state.hoveredProductId === product.id) state.hoveredProductId = null;
      card.classList.remove('hovered');
    });

    ['tl', 'tr', 'bl', 'br'].forEach(pos => {
      const orn = document.createElement('div');
      orn.className = 'corner-ornament ' + pos;
      card.appendChild(orn);
    });

    const imgArea = document.createElement('div');
    imgArea.className = 'product-image-area';

    const img = document.createElement('img');
    img.className = 'product-image';
    img.src = product.image;
    img.alt = product.name;
    imgArea.appendChild(img);

    const glow = document.createElement('div');
    glow.className = 'product-glow';
    imgArea.appendChild(glow);

    const badge = document.createElement('div');
    badge.className = 'availability-badge' + (product.availability === 'in-stock' ? ' in-stock' : '');
    badge.textContent = availabilityLabels[currentLang][product.availability];
    imgArea.appendChild(badge);

    const favToggle = document.createElement('button');
    favToggle.className = 'fav-toggle-btn' + (isFav ? ' active' : '');
    favToggle.setAttribute('aria-label', isFav ? t('fav_remove') : t('aria_favorites'));
    favToggle.innerHTML = `<svg width="12" height="12" fill="${isFav ? '#E29D30' : 'none'}" stroke="${isFav ? '#E29D30' : 'rgba(245,240,232,0.6)'}" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
    favToggle.addEventListener('click', e => {
      e.stopPropagation();
      toggleFavorite(product.id);
    });
    imgArea.appendChild(favToggle);

    card.appendChild(imgArea);

    const info = document.createElement('div');
    info.className = 'product-info';

    const topBlock = document.createElement('div');
    topBlock.innerHTML = `
      <p class="product-brand">${product.brand}</p>
      <h3 class="product-name">${product.name}</h3>
    `;
    info.appendChild(topBlock);

    const desc = document.createElement('p');
    desc.className = 'product-description';
    desc.textContent = description;
    info.appendChild(desc);

    const notesEl = document.createElement('p');
    notesEl.className = 'product-notes';
    notesEl.textContent = notes;
    info.appendChild(notesEl);

    const bottomRow = document.createElement('div');
    bottomRow.className = 'product-bottom-row';

    const priceWrap = document.createElement('div');
    priceWrap.innerHTML = `<span class="product-price">$${product.price}</span><span class="product-size">${product.size}</span>`;
    bottomRow.appendChild(priceWrap);

    const addBtn = document.createElement('button');
    addBtn.className = 'add-to-cart-btn';
    addBtn.textContent = t('add_to_cart');
    addBtn.addEventListener('click', e => {
      e.stopPropagation();
      addToCart(product);
    });
    bottomRow.appendChild(addBtn);

    info.appendChild(bottomRow);
    card.appendChild(info);

    return card;
  }

  renderProductGridInternal = function renderProductGridInternal() {
    const filtered = getFilteredProducts();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));

    // If a filter change shrank the results below the page we were on,
    // fall back to the last valid page instead of showing an empty grid.
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    if (state.currentPage < 1) state.currentPage = 1;

    const startIdx = (state.currentPage - 1) * PRODUCTS_PER_PAGE;
    const pageItems = filtered.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);

    productGrid.innerHTML = '';
    if (filtered.length === 0) {
      productGrid.classList.add('hidden');
      if (noResultsEl) noResultsEl.classList.remove('hidden');
    } else {
      productGrid.classList.remove('hidden');
      if (noResultsEl) noResultsEl.classList.add('hidden');
      pageItems.forEach(p => productGrid.appendChild(buildProductCard(p)));
    }

    if (desktopItemCount) desktopItemCount.textContent = itemsCountLabel(filtered.length, currentLang);
    if (mobileItemCount) mobileItemCount.textContent = itemsCountLabel(filtered.length, currentLang);

    renderPagination(totalPages);
  };

  function goToPage(page) {
    state.currentPage = page;
    renderProductGridInternal();
    // Jump back to the top of the catalog so the newly-loaded page is
    // actually visible, rather than leaving the scroll position wherever
    // it was on the (now different) previous page.
    const catalogSection = document.getElementById('catalog');
    if (catalogSection) catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderPagination(totalPages) {
    if (!paginationEl || !paginationNumbers) return;

    if (totalPages <= 1) {
      paginationEl.classList.add('hidden');
      return;
    }
    paginationEl.classList.remove('hidden');

    const current = state.currentPage;
    paginationPrevBtn.disabled = current <= 1;
    paginationNextBtn.disabled = current >= totalPages;

    // Build a compact page list: always show first/last, the current
    // page and its immediate neighbours, and "…" for any gap — standard
    // pagination pattern so this doesn't turn into 40 buttons for a
    // large catalog.
    const pages = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - current) <= 1) {
        pages.push(p);
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…');
      }
    }

    paginationNumbers.innerHTML = '';
    pages.forEach(p => {
      if (p === '…') {
        const span = document.createElement('span');
        span.className = 'pagination-ellipsis';
        span.textContent = '…';
        paginationNumbers.appendChild(span);
        return;
      }
      const btn = document.createElement('button');
      btn.className = 'pagination-btn' + (p === current ? ' active' : '');
      btn.textContent = p;
      btn.addEventListener('click', () => goToPage(p));
      paginationNumbers.appendChild(btn);
    });
  }

  if (paginationPrevBtn) {
    paginationPrevBtn.addEventListener('click', () => {
      if (state.currentPage > 1) goToPage(state.currentPage - 1);
    });
  }
  if (paginationNextBtn) {
    paginationNextBtn.addEventListener('click', () => {
      const totalPages = Math.max(1, Math.ceil(getFilteredProducts().length / PRODUCTS_PER_PAGE));
      if (state.currentPage < totalPages) goToPage(state.currentPage + 1);
    });
  }

  // Exposed globally so the search box and favorites panel can trigger a re-render.
  window.renderProductGrid = renderProductGridInternal;

  function toggleFavorite(id) {
    const idx = state.favorites.indexOf(id);
    if (idx > -1) state.favorites.splice(idx, 1); else state.favorites.push(id);
    persistFavorites();
    renderProductGridInternal();
    renderFavoritesPanel();
    updateBadges();
  }
}

// =======================================================
// CART (side panel, present on every page)
// =======================================================
const cartOverlay = document.getElementById('cart-overlay');
const cartBackdrop = document.getElementById('cart-backdrop');
const cartCloseBtn = document.getElementById('cart-close');
const cartItemsEl = document.getElementById('cart-items');
const cartFooterEl = document.getElementById('cart-footer');
const cartTotalEl = document.getElementById('cart-total');
const cartCountBadge = document.getElementById('cart-count');
const favCountBadge = document.getElementById('fav-count');

function openCart() {
  if (cartOverlay) cartOverlay.classList.remove('hidden');
}
function closeCart() {
  if (cartOverlay) cartOverlay.classList.add('hidden');
}

if (cartBtn) cartBtn.addEventListener('click', openCart);
if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

function addToCart(product) {
  state.cart.push(product);
  persistCart();
  renderCart();
  updateBadges();
}

function removeFromCart(index) {
  state.cart.splice(index, 1);
  persistCart();
  renderCart();
  updateBadges();
}

function renderCart() {
  if (!cartItemsEl) return;
  cartItemsEl.innerHTML = '';

  if (state.cart.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'cart-empty';
    empty.innerHTML = `
      <svg width="32" height="32" fill="none" stroke="rgba(226,157,48,0.3)" stroke-width="1" viewBox="0 0 24 24">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
      <p class="cart-empty-text">${t('cart_empty')}</p>
    `;
    cartItemsEl.appendChild(empty);
    if (cartFooterEl) cartFooterEl.classList.add('hidden');
  } else {
    state.cart.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <p class="cart-item-brand">${item.brand}</p>
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-size">${item.size}</p>
          <p class="cart-item-price">$${item.price}</p>
        </div>
      `;
      const removeBtn = document.createElement('button');
      removeBtn.className = 'cart-remove-btn';
      removeBtn.setAttribute('aria-label', t('fav_remove'));
      removeBtn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      removeBtn.addEventListener('click', () => removeFromCart(index));
      row.appendChild(removeBtn);
      cartItemsEl.appendChild(row);
    });

    const total = state.cart.reduce((s, p) => s + p.price, 0);
    if (cartTotalEl) cartTotalEl.textContent = `$${total}`;
    if (cartFooterEl) cartFooterEl.classList.remove('hidden');
  }
}

function updateBadges() {
  if (cartCountBadge) {
    cartCountBadge.textContent = state.cart.length;
    cartCountBadge.classList.toggle('hidden', state.cart.length === 0);
  }
  if (favCountBadge) {
    favCountBadge.textContent = state.favorites.length;
    favCountBadge.classList.toggle('hidden', state.favorites.length === 0);
  }
}

// =======================================================
// FAVORITES (side panel, present on every page)
// =======================================================
const favOverlay = document.getElementById('fav-overlay');
const favBackdrop = document.getElementById('fav-backdrop');
const favCloseBtn = document.getElementById('fav-close');
const favItemsEl = document.getElementById('fav-items');

function openFavorites() {
  renderFavoritesPanel();
  if (favOverlay) favOverlay.classList.remove('hidden');
}
function closeFavorites() {
  if (favOverlay) favOverlay.classList.add('hidden');
}

if (favBtn) favBtn.addEventListener('click', openFavorites);
if (favCloseBtn) favCloseBtn.addEventListener('click', closeFavorites);
if (favBackdrop) favBackdrop.addEventListener('click', closeFavorites);

function renderFavoritesPanel() {
  if (!favItemsEl) return;
  favItemsEl.innerHTML = '';

  // products[] comes from data.js, loaded on every page, so favorites
  // can be shown/removed/added-to-cart from About/Contact too.
  const favProducts = products.filter(p =>
    state.favorites.includes(p.id)
  );

  if (favProducts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'cart-empty';
    empty.innerHTML = `
      <svg width="32" height="32" fill="none" stroke="rgba(226,157,48,0.3)" stroke-width="1" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <p class="cart-empty-text">${t('fav_empty')}</p>
    `;
    favItemsEl.appendChild(empty);
    return;
  }

  favProducts.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <p class="cart-item-brand">${item.brand}</p>
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-size">${item.size}</p>
        <p class="cart-item-price">$${item.price}</p>
        <div class="cart-item-actions">
          <button class="fav-remove-btn" type="button">${t('fav_remove')}</button>
          <button class="fav-add-cart-btn" type="button">${t('fav_add_cart')}</button>
        </div>
      </div>
    `;
    row.querySelector('.fav-remove-btn').addEventListener('click', () => {
      const idx = state.favorites.indexOf(item.id);
      if (idx > -1) state.favorites.splice(idx, 1);
      persistFavorites();
      updateBadges();
      renderFavoritesPanel();
      if (document.getElementById('product-grid') && window.renderProductGrid) {
        window.renderProductGrid();
      }
    });
    row.querySelector('.fav-add-cart-btn').addEventListener('click', () => {
      addToCart(item);
    });
    favItemsEl.appendChild(row);
  });
}

// =======================================================
// ORDER REQUEST MODAL (present on every page)
// =======================================================
const orderOverlay = document.getElementById('order-overlay');
const orderBackdrop = document.getElementById('order-backdrop');
const orderCloseBtn = document.getElementById('order-close');
const orderForm = document.getElementById('order-form');
const orderSummaryEl = document.getElementById('order-summary');
const orderSubmitBtn = document.getElementById('order-submit-btn');
const orderSuccessNote = document.getElementById('order-success-note');
const orderErrorNote = document.getElementById('order-error-note');
const checkoutBtn = document.getElementById('checkout-btn');

function renderOrderSummary() {
  if (!orderSummaryEl) return;
  orderSummaryEl.innerHTML = '';

  state.cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'order-summary-item';
    row.innerHTML = `
      <span class="order-summary-item-name">${item.brand} ${item.name} (${item.size})</span>
      <span>$${item.price}</span>
    `;
    orderSummaryEl.appendChild(row);
  });

  const total = state.cart.reduce((s, p) => s + p.price, 0);
  const totalRow = document.createElement('div');
  totalRow.className = 'order-summary-total';
  totalRow.innerHTML = `<span>${t('cart_total')}</span><span>$${total}</span>`;
  orderSummaryEl.appendChild(totalRow);
}

function openOrderModal() {
  if (state.cart.length === 0) return;
  renderOrderSummary();
  if (orderSuccessNote) orderSuccessNote.classList.add('hidden');
  if (orderErrorNote) orderErrorNote.classList.add('hidden');
  if (orderForm) orderForm.classList.remove('hidden');
  closeCart();
  if (orderOverlay) orderOverlay.classList.remove('hidden');
}

function closeOrderModal() {
  if (orderOverlay) orderOverlay.classList.add('hidden');
}

if (checkoutBtn) checkoutBtn.addEventListener('click', openOrderModal);
if (orderCloseBtn) orderCloseBtn.addEventListener('click', closeOrderModal);
if (orderBackdrop) orderBackdrop.addEventListener('click', closeOrderModal);

if (orderForm) {
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (orderErrorNote) orderErrorNote.classList.add('hidden');

    const name = document.getElementById('order-name').value.trim();
    const telegram = document.getElementById('order-telegram').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const total = state.cart.reduce((s, p) => s + p.price, 0);

    orderSubmitBtn.disabled = true;
    const originalLabel = orderSubmitBtn.textContent;
    orderSubmitBtn.textContent = t('order_submitting_btn');

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          telegram,
          phone,
          items: state.cart,
          total,
        }),
      });

      if (!response.ok) throw new Error('Request failed');

      // Success: clear the cart, show confirmation, hide the form itself
      // (nothing left to submit).
      state.cart = [];
      persistCart();
      renderCart();
      updateBadges();

      orderForm.classList.add('hidden');
      if (orderSuccessNote) orderSuccessNote.classList.remove('hidden');
    } catch (err) {
      if (orderErrorNote) orderErrorNote.classList.remove('hidden');
    } finally {
      orderSubmitBtn.disabled = false;
      orderSubmitBtn.textContent = originalLabel;
    }
  });
}

// =======================================================
// INITIAL RENDER
// =======================================================
// Cart/badges don't depend on the product catalog, so they render
// immediately — no flash of an empty header. The catalog, hero slider
// and favorites panel (which looks up product details by id) wait for
// data.js's fetch of /data/products.json + /data/slides.json, and
// i18n.js's fetch of /data/i18n.json, to finish first.
renderCart();
renderFavoritesPanel();
updateBadges();

(async () => {
  await Promise.all([window.i18nReady, window.dataReady]);
  if (typeof initHero === 'function') initHero();
  if (typeof renderSidebars === 'function') renderSidebars();
  if (typeof renderProductGridInternal === 'function') renderProductGridInternal();
  // Re-render now that `products` is actually populated, so any
  // already-favorited items show their real name/image/price instead
  // of nothing.
  renderFavoritesPanel();
})();
