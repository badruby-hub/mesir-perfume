// ==================== DATA LOADER ====================
// Products and hero slides used to be hardcoded here. Now they live as
// plain JSON files in /data/, which the admin panel (see /admin) edits by
// committing straight to the GitHub repo — Vercel then redeploys
// automatically. This file just fetches that JSON at page-load time.
//
// `brands` / `sizes` / `countries` are the filter category *lists* shown
// in the sidebar — these change far less often than the product catalog
// itself, so they stay as a small static file (data/filters.json) rather
// than going through the admin UI. Ask if you'd like those editable too.

let products = [];
let slides = [];
let brands = [];
let sizes = [];
let countries = [];

// Other scripts (script.js) await this before touching products/slides,
// so nothing tries to render an empty list before the fetch resolves.
window.dataReady = (async () => {
  try {
    const [productsRes, slidesRes, filtersRes] = await Promise.all([
      fetch('data/products.json'),
      fetch('data/slides.json'),
      fetch('data/filters.json'),
    ]);
    products = await productsRes.json();
    slides = await slidesRes.json();
    const filters = await filtersRes.json();
    brands = filters.brands || [];
    sizes = filters.sizes || [];
    countries = filters.countries || [];
  } catch (err) {
    console.error('Failed to load site data:', err);
  }
})();
