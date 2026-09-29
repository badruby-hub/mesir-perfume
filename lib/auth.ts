// Minimal password gate + signed session cookie for the /admin panel —
// no database needed. The session is a base64 JSON payload with an
// expiry timestamp, signed with HMAC-SHA256 so it can't be forged or
// tampered with client-side (the secret never leaves the server).
//
// Required environment variables:
//   ADMIN_PASSWORD        — the password you type into the /admin login form
//   ADMIN_SESSION_SECRET  — any long random string, used only to sign
//                            the session cookie (e.g. `openssl rand -hex 32`)
import 'server-only';
import crypto from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'mesir_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function sign(payload: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// httpOnly: JS on the page can't read it (XSS protection).
// secure: only sent over HTTPS (Vercel is always HTTPS in production).
// sameSite strict: not sent on cross-site requests.
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/',
};

export function setSessionCookie(res: NextResponse): void {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const encoded = Buffer.from(payload).toString('base64url');
  res.cookies.set(COOKIE_NAME, `${encoded}.${sign(encoded)}`, {
    ...COOKIE_OPTIONS,
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });
}

// Returns true if the request carries a valid, unexpired session cookie.
export function isAuthenticated(req: NextRequest): boolean {
  try {
    const raw = req.cookies.get(COOKIE_NAME)?.value;
    if (!raw) return false;

    const [encoded, sig] = raw.split('.');
    if (!encoded || !sig) return false;

    // Constant-time comparison to avoid timing attacks.
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(sign(encoded));
    if (sigBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function checkPassword(password: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('ADMIN_PASSWORD is not set');
  if (typeof password !== 'string') return false;

  // Constant-time comparison.
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
