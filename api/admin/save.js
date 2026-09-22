// api/admin/save.js
//
// Upserts one piece of data (products / slides / i18n / filters / labels)
// into Supabase. Expects: { type: string, data: <value> }
const { writeRow } = require('../../lib/supabase');
const { isAuthenticated } = require('../../lib/auth');

const VALID_TYPES = ['products', 'slides', 'i18n', 'filters', 'labels'];

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const { type, data } = req.body || {};

    if (!VALID_TYPES.includes(type) || data === undefined) {
      res.status(400).json({ error: 'Missing or invalid "type"/"data"' });
      return;
    }

    await writeRow(type, data);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Admin save error:', err);
    res.status(500).json({ error: 'Failed to save to Supabase', detail: String(err.message || err) });
  }
};
