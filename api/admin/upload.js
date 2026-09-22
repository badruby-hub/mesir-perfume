// api/admin/upload.js
//
// Uploads an image picked from the admin's computer straight into this
// repo's assets/uploads/ folder (as a git commit, same as everything
// else the admin panel saves) and returns the path the site can use as
// an <img src>. Vercel serves it like any other static file — no
// separate image host or storage service needed.
//
// Expects: { filename: string, contentBase64: string }
// (contentBase64 is the raw base64 payload — strip any "data:image/...;base64,"
// prefix client-side before sending.)
const { writeBinaryFile } = require('../../lib/github');
const { isAuthenticated } = require('../../lib/auth');

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — generous for a product photo

function sanitizeFilename(name) {
  const hasExt = name.includes('.');
  const ext = hasExt
    ? (name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    : 'jpg';
  const base = (hasExt ? name.replace(/\.[^.]+$/, '') : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'image';
  return `${base}.${ext}`;
}

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
    const { filename, contentBase64 } = req.body || {};

    if (!filename || !contentBase64) {
      res.status(400).json({ error: 'Missing "filename" or "contentBase64"' });
      return;
    }

    // Rough size check (base64 is ~4/3 the size of the original bytes).
    if (contentBase64.length * 0.75 > MAX_BYTES) {
      res.status(400).json({ error: 'Image is too large (max 5 MB)' });
      return;
    }

    const safeName = sanitizeFilename(filename);
    // Timestamp prefix guarantees a unique filename, so we never need to
    // read an existing file's sha first (no conflict is possible).
    const path = `assets/uploads/${Date.now()}-${safeName}`;

    await writeBinaryFile(path, contentBase64, null, `Upload image: ${safeName}`);

    // Site-relative path — works because this repo IS the deployed site.
    res.status(200).json({ success: true, path: `/${path}` });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed', detail: String(err.message || err) });
  }
};
