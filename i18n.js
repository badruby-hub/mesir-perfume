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
let translations = { en: {}, ru: {} };
let countryLabels = { en: {}, ru: {} };
let availabilityLabels = { en: {}, ru: {} };

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
    if (saved === 'en' || saved === 'ru') return saved;
  } catch (e) {
    /* ignore */
  }
  // Fall back to browser language, default to English.
  const browserLang = (navigator.language || '').toLowerCase();
  return browserLang.startsWith('ru') ? 'ru' : 'en';
}

let currentLang = getSavedLanguage();

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || (translations.en && translations.en[key]) || key;
}

function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'ru') return;
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

  // Keep the two language-switch buttons (desktop + mobile) visually in sync.
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
  });
}

// Fetched once at page load; script.js (and this file's own
// DOMContentLoaded handler) await this before rendering anything that
// depends on translated text.
window.i18nReady = (async () => {
  try {
    const [i18nRes, labelsRes] = await Promise.all([
      fetch('data/i18n.json'),
      fetch('data/labels.json'),
    ]);
    translations = await i18nRes.json();
    const labels = await labelsRes.json();
    countryLabels = labels.countryLabels || countryLabels;
    availabilityLabels = labels.availabilityLabels || availabilityLabels;
  } catch (err) {
    console.error('Failed to load translations:', err);
  }
})();

document.addEventListener('DOMContentLoaded', async () => {
  document.documentElement.setAttribute('lang', currentLang);
  await window.i18nReady;
  applyStaticTranslations();

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang')));
  });
});
