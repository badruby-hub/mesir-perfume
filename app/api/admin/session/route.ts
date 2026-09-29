// The session cookie is httpOnly (page JS can't read it on purpose —
// that's what stops it being stolen via XSS), so the admin page asks the
// server whether it's logged in via this endpoint instead.
import { NextResponse, type NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export async function GET(req: NextRequest) {
  return NextResponse.json({ authenticated: isAuthenticated(req) });
}
