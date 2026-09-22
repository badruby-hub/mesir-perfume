// api/admin/data.js
//
// Returns the current content of every editable JSON file, read live
// from GitHub (not from the deployed site's own /data/*.json — those can
// lag a few seconds behind the latest commit while Vercel redeploys).
const { readFile } = require('../../lib/github');
const { isAuthenticated } = require('../../lib/auth');

const FILES = {
  products: 'data/products.json',
  slides: 'data/slides.json',
  i18n: 'data/i18n.json',
  filters: 'data/filters.json',
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
      Object.entries(FILES).map(async ([key, path]) => {
        const { content } = await readFile(path);
        return [key, JSON.parse(content)];
      })
    );

    res.status(200).json(Object.fromEntries(entries));
  } catch (err) {
    console.error('Admin data fetch error:', err);
    res.status(500).json({ error: 'Failed to load data from GitHub' });
  }
};
