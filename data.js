// ==================== DATA LOADER ====================
// Products and hero slides live in Supabase now (edited via the admin
// panel at /admin), not hardcoded here.
//
// The actual fetch straight to Supabase (no Vercel function in the
// middle) is set up in i18n.js, which loads before this file and
// creates window.__siteDataPromise — this file just reuses that same
// promise, so the two scripts share ONE network request between them
// instead of two.

let products = [];
let slides = [];
let brands = [];
let sizes = [];
let countries = [];

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
