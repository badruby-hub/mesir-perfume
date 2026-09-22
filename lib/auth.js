// lib/auth.js
//
// Minimal password-gate + signed session cookie for the /admin panel —
// no database needed. The session is a base64 JSON payload with an
// expiry timestamp, signed with HMAC-SHA256 so it can't be forged or
// tampered with client-side (the secret never leaves the server).
//
// Required environment variables:
//   ADMIN_PASSWORD        — the password you type into the /admin login form
//   ADMIN_SESSION_SECRET  — any long random string, used only to sign
//                            the session cookie (e.g. generate one with
//                            `openssl rand -hex 32`)

const crypto = require('crypto');

const COOKIE_NAME = 'mesir_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function sign(payload) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function createSessionCookie() {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const encoded = Buffer.from(payload).toString('base64url');
  const sig = sign(encoded);
  const value = `${encoded}.${sig}`;

  // httpOnly: JS on the page can't read it (XSS protection).
  // Secure: only sent over HTTPS (Vercel is always HTTPS in production).
  // SameSite=Strict: not sent on cross-site requests.
  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    out[key] = val;
  });
  return out;
}

// Returns true if the request carries a valid, unexpired session cookie.
function isAuthenticated(req) {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const raw = cookies[COOKIE_NAME];
    if (!raw) return false;

    const [encoded, sig] = raw.split('.');
    if (!encoded || !sig) return false;

    const expectedSig = sign(encoded);
    // Constant-time comparison to avoid timing attacks.
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch (err) {
    return false;
  }
}

function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('ADMIN_PASSWORD is not set');
  if (typeof password !== 'string') return false;

  // Constant-time comparison.
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { createSessionCookie, clearSessionCookie, isAuthenticated, checkPassword };
