// Uploads an image picked from the admin's computer to Supabase Storage
// (bucket "uploads", must be created as PUBLIC in the Supabase dashboard)
// and returns its public URL for use as an <img src>.
//
// Expects: { filename: string, contentBase64: string }
// (contentBase64 is the raw base64 payload — the client strips any
// "data:image/...;base64," prefix before sending.)
import { NextResponse, type NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { uploadFile } from '@/lib/supabase';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — generous for a product photo

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

function sanitizeFilename(name: string): string {
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

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { filename, contentBase64 } = await req.json().catch(() => ({}));

    if (typeof filename !== 'string' || typeof contentBase64 !== 'string' || !filename || !contentBase64) {
      return NextResponse.json({ error: 'Missing "filename" or "contentBase64"' }, { status: 400 });
    }

    // Rough size check (base64 is ~4/3 the size of the original bytes).
    if (contentBase64.length * 0.75 > MAX_BYTES) {
      return NextResponse.json({ error: 'Image is too large (max 5 MB)' }, { status: 400 });
    }

    const safeName = sanitizeFilename(filename);
    const ext = safeName.split('.').pop() || '';
    // Timestamp prefix guarantees a unique object name.
    const path = `${Date.now()}-${safeName}`;

    const publicUrl = await uploadFile(path, contentBase64, CONTENT_TYPES[ext] || 'application/octet-stream');
    return NextResponse.json({ success: true, path: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: 'Upload failed', detail: String((err as Error).message || err) },
      { status: 500 }
    );
  }
}
