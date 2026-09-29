// Small wrapper around Supabase's auto-generated REST API (PostgREST) and
// Storage API — no npm dependency needed, just plain fetch calls. Server
// only: the service role key never reaches the browser.
//
// Required environment variables:
//   SUPABASE_URL              — Project Settings → API → Project URL
//   SUPABASE_SERVICE_ROLE_KEY — Project Settings → API → service_role key
//                                (bypasses Row Level Security, which is
//                                what lets the admin panel write)
import 'server-only';
import { cache } from 'react';
import { unstable_rethrow } from 'next/navigation';
import type { SiteData, SiteDataKey } from './types';

function getConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return { url: url.replace(/\/$/, ''), key };
}

function authHeaders(key: string, extra?: Record<string, string>) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  };
}

export const SITE_DATA_DEFAULTS: SiteData = {
  products: [],
  slides: [],
  i18n: { en: {}, ru: {}, hy: {} },
  filters: { brands: [], sizes: [], countries: [] },
  labels: {
    countryLabels: { en: {}, ru: {}, hy: {} },
    availabilityLabels: { en: {}, ru: {}, hy: {} },
    categoryLabels: { en: {}, ru: {}, hy: {} },
  },
};

// Reads every row of `site_data` in one request. Not cached, so an admin
// publish shows up on the very next page view. Wrapped in React's cache()
// so the layout and page of one request share a single fetch.
export const getSiteData = cache(async (): Promise<SiteData> => {
  try {
    const { url, key } = getConfig();
    const res = await fetch(`${url}/rest/v1/site_data?select=key,value`, {
      headers: authHeaders(key),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Supabase read failed (${res.status}): ${await res.text()}`);

    const rows: { key: SiteDataKey; value: unknown }[] = await res.json();
    const data: SiteData = { ...SITE_DATA_DEFAULTS };
    for (const row of rows) {
      if (row.key in data && row.value != null) {
        (data as unknown as Record<string, unknown>)[row.key] = row.value;
      }
    }
    // Older rows may lack some label groups (e.g. categoryLabels).
    data.labels = { ...SITE_DATA_DEFAULTS.labels, ...data.labels };
    return data;
  } catch (err) {
    // Next.js signals dynamic rendering by throwing — let that through.
    unstable_rethrow(err);
    // Render the site with empty data rather than crashing the page.
    console.error('Failed to load site data:', err);
    return SITE_DATA_DEFAULTS;
  }
});

// Reads one row's `value` column by its `key`. Returns null if no such
// row exists yet (first run before seeding).
export async function readRow(rowKey: string): Promise<unknown> {
  const { url, key } = getConfig();
  const res = await fetch(
    `${url}/rest/v1/site_data?key=eq.${encodeURIComponent(rowKey)}&select=value`,
    { headers: authHeaders(key), cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error(`Supabase read failed (${res.status}) for "${rowKey}": ${await res.text()}`);
  }

  const rows: { value: unknown }[] = await res.json();
  return rows.length ? rows[0].value : null;
}

// Inserts or updates a row's value (upsert on the `key` primary key).
export async function writeRow(rowKey: string, value: unknown): Promise<void> {
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
export async function uploadFile(path: string, base64Content: string, contentType: string): Promise<string> {
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
