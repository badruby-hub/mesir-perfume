// api/admin/upload.js
//
// Uploads an image picked from the admin's computer to Supabase Storage
// (bucket "uploads", must be created as PUBLIC in the Supabase dashboard)
// and returns its public URL for use as an <img src>.
//
// Expects: { filename: string, contentBase64: string }
// (contentBase64 is the raw base64 payload — strip any
// "data:image/...;base64," prefix client-side before sending.)
const { uploadFile } = require('../../lib/supabase');
const { isAuthenticated } = require('../../lib/auth');

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — generous for a product photo

const CONTENT_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

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
    const ext = safeName.split('.').pop();
    // Timestamp prefix guarantees a unique object name, so we never clash
    // with a previous upload.
    const path = `${Date.now()}-${safeName}`;

    const publicUrl = await uploadFile(path, contentBase64, CONTENT_TYPES[ext] || 'application/octet-stream');

    res.status(200).json({ success: true, path: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed', detail: String(err.message || err) });
  }
};
