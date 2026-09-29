// Upserts one piece of data (products / slides / i18n / filters / labels)
// into Supabase. Expects: { type: string, data: <value> }
import { NextResponse, type NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { writeRow } from '@/lib/supabase';
import { SITE_DATA_KEYS, type SiteDataKey } from '@/lib/types';

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { type, data } = await req.json().catch(() => ({}));

    if (!SITE_DATA_KEYS.includes(type as SiteDataKey) || data === undefined) {
      return NextResponse.json({ error: 'Missing or invalid "type"/"data"' }, { status: 400 });
    }

    await writeRow(type, data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin save error:', err);
    return NextResponse.json(
      { error: 'Failed to save to Supabase', detail: String((err as Error).message || err) },
      { status: 500 }
    );
  }
}
