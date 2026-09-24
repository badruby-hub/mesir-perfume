// =======================================================
// I18N — English / Russian
// Language choice persists in localStorage across pages.
//
// The actual translation strings used to be hardcoded in this file.
// Now they live in /data/i18n.json (and /data/labels.json for the
// country/availability display labels), which the admin panel (see
// /admin) edits by committing straight to the GitHub repo — Vercel then
// redeploys automatically. This file fetches that JSON at page-load
// time and exposes `window.i18nReady`, which script.js awaits before
// rendering anything that calls t().
// =======================================================
let translations = { en: {}, ru: {}, hy: {} };
let countryLabels = { en: {}, ru: {}, hy: {} };
let availabilityLabels = { en: {}, ru: {}, hy: {} };

// ---- Russian pluralization helper (1 товар / 2 товара / 5 товаров) ----
function pluralRu(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function itemsCountLabel(n, lang) {
  if (lang === 'ru') {
    return `${n} ${pluralRu(n, 'аромат', 'аромата', 'ароматов')}`;
  }
  return `${n} ${n === 1 ? 'fragrance' : 'fragrances'}`;
}

// =======================================================
// Language state
// =======================================================
function getSavedLanguage() {
  try {
    const saved = localStorage.getItem('mesir_lang');
    if (saved === 'en' || saved === 'ru' || saved === 'hy') return saved;
  } catch (e) {
    /* ignore */
  }
  // Fall back to browser language, default to English.
  const browserLang = (navigator.language || '').toLowerCase();
  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('hy')) return 'hy';
  return 'en';
}

let currentLang = getSavedLanguage();

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || (translations.en && translations.en[key]) || key;
}

function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'ru' && lang !== 'hy') return;
  currentLang = lang;
  try {
    localStorage.setItem('mesir_lang', lang);
  } catch (e) {
    /* ignore */
  }
  document.documentElement.setAttribute('lang', lang);
  applyStaticTranslations();
  if (typeof onLanguageChange === 'function') onLanguageChange();
}

// Applies every data-i18n / data-i18n-placeholder / data-i18n-html
// attribute found on the current page. Safe to call on any page —
// simply does nothing for attributes that aren't present.
function applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });

  // Keep the language-menu items and the toggle's displayed code in sync.
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
  });
  const langCurrentEl = document.getElementById('lang-current');
  if (langCurrentEl) langCurrentEl.textContent = currentLang.toUpperCase();
}

// Fetched once at page load; script.js (and this file's own
// DOMContentLoaded handler) await this before rendering anything that
// depends on translated text. Shares one network request with data.js
// via window.__siteDataPromise — see the comment there.
//
// This goes STRAIGHT to Supabase from the browser (no Vercel function in
// the middle) — one network hop instead of two. Safe to have this key in
// client-side code: it's the "anon"/"publishable" key, which Row Level
// Security restricts to read-only (see supabase/rls.sql). Writes still
// only ever happen server-side, in api/admin/*, using the separate
// service_role key that never reaches the browser.
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-OR-PUBLISHABLE-KEY';

function fetchSiteDataFromSupabase() {
  return fetch(`${SUPABASE_URL}/rest/v1/site_data?select=key,value`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })
    .then((r) => r.json())
    .then((rows) => {
      const obj = {};
      (rows || []).forEach((row) => { obj[row.key] = row.value; });
      return obj;
    });
}

// ---- Cache the last successful fetch, so a repeat visit can paint the
// CORRECT language instantly instead of flashing the English fallback
// text baked into the HTML while a fresh network request is in flight.
// The real fetch still always happens in the background to pick up any
// content the admin has since published — this is a "stale, then
// revalidate" pattern, not a replacement for the live fetch. ----
const SITE_DATA_CACHE_KEY = 'mesir_site_data_cache';

function readSiteDataCache() {
  try {
    const raw = localStorage.getItem(SITE_DATA_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeSiteDataCache(data) {
  try {
    localStorage.setItem(SITE_DATA_CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    /* ignore quota / private-mode errors */
  }
}

// Exposed globally so data.js can reuse the SAME cached blob for
// products/slides/filters, instead of each file reading localStorage
// separately.
window.__cachedSiteData = readSiteDataCache();

if (window.__cachedSiteData) {
  translations = window.__cachedSiteData.i18n || translations;
  const cachedLabels = window.__cachedSiteData.labels || {};
  countryLabels = cachedLabels.countryLabels || countryLabels;
  availabilityLabels = cachedLabels.availabilityLabels || availabilityLabels;
}

window.__siteDataPromise = window.__siteDataPromise || fetchSiteDataFromSupabase().then((data) => {
  writeSiteDataCache(data);
  return data;
});

window.i18nReady = (async () => {
  try {
    const all = await window.__siteDataPromise;
    translations = all.i18n || translations;
    const labels = all.labels || {};
    countryLabels = labels.countryLabels || countryLabels;
    availabilityLabels = labels.availabilityLabels || availabilityLabels;
  } catch (err) {
    console.error('Failed to load translations:', err);
  }
})();

document.addEventListener('DOMContentLoaded', async () => {
  document.documentElement.setAttribute('lang', currentLang);

  // Paint immediately with cached (almost certainly still-correct) text
  // if we have it — no need to wait for the network for this first pass.
  if (window.__cachedSiteData) {
    applyStaticTranslations();
  }

  await window.i18nReady;
  // Re-apply with the freshly-fetched data. If nothing changed since the
  // cache was written, this is visually a no-op; if the admin published
  // an edit, this is what brings it in.
  applyStaticTranslations();

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.getAttribute('data-lang'));
      closeLangDropdown();
    });
  });

  // Dropdown open/close: toggle on click, close on outside click or Escape.
  const langDropdown = document.getElementById('lang-dropdown');
  const langToggle = document.getElementById('lang-dropdown-toggle');
  const langMenu = document.getElementById('lang-dropdown-menu');

  function openLangDropdown() {
    if (!langDropdown) return;
    langDropdown.classList.add('open');
    langMenu.classList.remove('hidden');
    langToggle.setAttribute('aria-expanded', 'true');
  }
  function closeLangDropdown() {
    if (!langDropdown) return;
    langDropdown.classList.remove('open');
    langMenu.classList.add('hidden');
    langToggle.setAttribute('aria-expanded', 'false');
  }

  if (langToggle) {
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (langMenu.classList.contains('hidden')) {
        openLangDropdown();
      } else {
        closeLangDropdown();
      }
    });

    document.addEventListener('click', (e) => {
      if (langDropdown && !langDropdown.contains(e.target)) closeLangDropdown();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLangDropdown();
    });
  }
});
