// Returns the current content of every editable piece of data, read live
// from Supabase.
import { NextResponse, type NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { readRow, SITE_DATA_DEFAULTS } from '@/lib/supabase';
import { SITE_DATA_KEYS } from '@/lib/types';

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const entries = await Promise.all(
      SITE_DATA_KEYS.map(async (k) => [k, (await readRow(k)) ?? SITE_DATA_DEFAULTS[k]])
    );
    return NextResponse.json(Object.fromEntries(entries));
  } catch (err) {
    console.error('Admin data fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to load data from Supabase', detail: String((err as Error).message || err) },
      { status: 500 }
    );
  }
}
