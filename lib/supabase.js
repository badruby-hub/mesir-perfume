// lib/supabase.js
//
// Small wrapper around Supabase's auto-generated REST API (PostgREST) and
// Storage API — no npm dependency needed, just plain fetch calls. All of
// this runs server-side only (in api/ functions); the Supabase service
// role key never reaches the browser.
//
// Required environment variables:
//   SUPABASE_URL              — Project Settings → API → Project URL
//   SUPABASE_SERVICE_ROLE_KEY — Project Settings → API → service_role key
//                                (NOT the anon/public key — this one
//                                bypasses Row Level Security, which is
//                                what lets our server write freely while
//                                the browser never sees this key at all)

function getConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return { url: url.replace(/\/$/, ''), key };
}

function authHeaders(key, extra) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  };
}

// Reads one row's `value` column from the `site_data` table by its `key`.
// Returns null if no such row exists yet (first-run before seeding).
async function readRow(rowKey) {
  const { url, key } = getConfig();
  const res = await fetch(
    `${url}/rest/v1/site_data?key=eq.${encodeURIComponent(rowKey)}&select=value`,
    { headers: authHeaders(key) }
  );

  if (!res.ok) {
    throw new Error(`Supabase read failed (${res.status}) for "${rowKey}": ${await res.text()}`);
  }

  const rows = await res.json();
  return rows.length ? rows[0].value : null;
}

// Inserts or updates a row's value (upsert on the `key` primary key).
async function writeRow(rowKey, value) {
  const { url, key } = getConfig();
  const res = await fetch(`${url}/rest/v1/site_data`, {
    method: 'POST',
    headers: authHeaders(key, {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    }),
    body: JSON.stringify({ key: rowKey, value, updated_at: new Date().toISOString() }),
  });

  if (!res.ok) {
    throw new Error(`Supabase write failed (${res.status}) for "${rowKey}": ${await res.text()}`);
  }
}

// Uploads a base64-encoded file to the "uploads" Storage bucket (must be
// created as a PUBLIC bucket in the Supabase dashboard first) and returns
// its public URL.
async function uploadFile(path, base64Content, contentType) {
  const { url, key } = getConfig();
  const buffer = Buffer.from(base64Content, 'base64');

  const res = await fetch(`${url}/storage/v1/object/uploads/${path}`, {
    method: 'POST',
    headers: authHeaders(key, {
      'Content-Type': contentType || 'application/octet-stream',
      'x-upsert': 'true',
    }),
    body: buffer,
  });

  if (!res.ok) {
    throw new Error(`Supabase upload failed (${res.status}): ${await res.text()}`);
  }

  return `${url}/storage/v1/object/public/uploads/${path}`;
}

module.exports = { readRow, writeRow, uploadFile };
