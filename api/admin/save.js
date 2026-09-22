// api/admin/save.js
//
// Writes an updated JSON file back to GitHub — this is a real commit,
// which is what makes Vercel redeploy the site with the new data.
// Expects: { type: 'products' | 'slides' | 'i18n' | 'filters', data: <value>, message?: string }
const { readFile, writeFile } = require('../../lib/github');
const { isAuthenticated } = require('../../lib/auth');

const FILES = {
  products: 'data/products.json',
  slides: 'data/slides.json',
  i18n: 'data/i18n.json',
  filters: 'data/filters.json',
};

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
    const { type, data, message } = req.body || {};
    const path = FILES[type];

    if (!path || data === undefined) {
      res.status(400).json({ error: 'Missing or invalid "type"/"data"' });
      return;
    }

    // Re-read the current sha right before writing (rather than trusting
    // one the client might have held onto for a while) to minimise the
    // chance of clobbering a concurrent edit.
    const { sha } = await readFile(path);
    const content = JSON.stringify(data, null, 2) + '\n';
    const commitMessage = message || `Update ${type} via admin panel`;

    await writeFile(path, content, sha, commitMessage);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Admin save error:', err);
    res.status(500).json({ error: 'Failed to save to GitHub', detail: String(err.message || err) });
  }
};
