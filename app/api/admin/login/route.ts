import { NextResponse } from 'next/server';
import { checkPassword, setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { password } = await req.json().catch(() => ({}));

    if (!checkPassword(password)) {
      // Same generic message whether the password field was missing or
      // simply wrong — don't help an attacker narrow things down.
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    setSessionCookie(res);
    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }
}
