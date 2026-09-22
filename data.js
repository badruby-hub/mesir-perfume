// ==================== DATA LOADER ====================
// Products and hero slides live in Supabase now (edited via the admin
// panel at /admin), not hardcoded here. This file fetches them from
// /api/site-data, which reads from Supabase server-side.
//
// `window.__siteDataPromise` is shared with i18n.js so the two scripts
// only trigger ONE network request between them, regardless of which
// loads first — whichever runs first creates the promise, the other
// just reuses it.

let products = [];
let slides = [];
let brands = [];
let sizes = [];
let countries = [];

window.__siteDataPromise = window.__siteDataPromise || fetch('/api/site-data').then((r) => r.json());

// Other scripts (script.js) await this before touching products/slides,
// so nothing tries to render an empty list before the fetch resolves.
window.dataReady = (async () => {
  try {
    const all = await window.__siteDataPromise;
    products = all.products || [];
    slides = all.slides || [];
    const filters = all.filters || {};
    brands = filters.brands || [];
    sizes = filters.sizes || [];
    countries = filters.countries || [];
  } catch (err) {
    console.error('Failed to load site data:', err);
  }
})();
