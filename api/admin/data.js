// api/admin/data.js
//
// Returns the current content of every editable piece of data, read live
// from Supabase.
const { readRow } = require('../../lib/supabase');
const { isAuthenticated } = require('../../lib/auth');

const KEYS = ['products', 'slides', 'i18n', 'filters', 'labels'];
const DEFAULTS = {
  products: [],
  slides: [],
  i18n: { en: {}, ru: {} },
  filters: { brands: [], sizes: [], countries: [] },
  labels: { countryLabels: { en: {}, ru: {} }, availabilityLabels: { en: {}, ru: {} } },
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const entries = await Promise.all(
      KEYS.map(async (k) => [k, (await readRow(k)) ?? DEFAULTS[k]])
    );
    res.status(200).json(Object.fromEntries(entries));
  } catch (err) {
    console.error('Admin data fetch error:', err);
    res.status(500).json({ error: 'Failed to load data from Supabase', detail: String(err.message || err) });
  }
};
