// ==================== DATA LOADER ====================
// Products and hero slides live in Supabase now (edited via the admin
// panel at /admin), not hardcoded here.
//
// The actual fetch straight to Supabase (no Vercel function in the
// middle) is set up in i18n.js, which loads before this file and
// creates window.__siteDataPromise — this file just reuses that same
// promise, so the two scripts share ONE network request between them
// instead of two. i18n.js also reads a cached copy of the last
// successful fetch into window.__cachedSiteData — reused here so the
// catalog/hero can paint instantly on a repeat visit instead of sitting
// empty until the network responds.

let products = [];
let slides = [];
let brands = [];
let sizes = [];
let countries = [];

if (window.__cachedSiteData) {
  products = window.__cachedSiteData.products || [];
  slides = window.__cachedSiteData.slides || [];
  const cachedFilters = window.__cachedSiteData.filters || {};
  brands = cachedFilters.brands || [];
  sizes = cachedFilters.sizes || [];
  countries = cachedFilters.countries || [];
}

// Other scripts (script.js) await this before re-rendering with the
// freshly-fetched data — see the cache note above for why products/
// slides/etc. may already be populated before this resolves.
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
