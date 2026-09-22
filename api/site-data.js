// api/site-data.js
//
// Public, unauthenticated endpoint — this is what the live site (data.js /
// i18n.js) fetches to render the catalog, hero slides and translations.
// Cached briefly at the edge so normal traffic doesn't hit Supabase on
// every single page view, while still picking up admin publishes quickly.
const { readRow } = require('../lib/supabase');

const KEYS = ['products', 'slides', 'i18n', 'filters', 'labels'];
const DEFAULTS = {
  products: [],
  slides: [],
  i18n: { en: {}, ru: {} },
  filters: { brands: [], sizes: [], countries: [] },
  labels: { countryLabels: { en: {}, ru: {} }, availabilityLabels: { en: {}, ru: {} } },
};

module.exports = async (req, res) => {
  try {
    const entries = await Promise.all(
      KEYS.map(async (k) => [k, (await readRow(k)) ?? DEFAULTS[k]])
    );
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.status(200).json(Object.fromEntries(entries));
  } catch (err) {
    console.error('Site data fetch error:', err);
    res.status(500).json({ error: 'Failed to load site data' });
  }
};
