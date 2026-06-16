import crypto from 'node:crypto';

// Lightweight, dependency-free auth primitives (node:crypto only).
//
//   • Passwords  → scrypt with a per-password random salt, stored as
//     `scrypt$<saltHex>$<hashHex>`. Verified in constant time.
//   • Sessions   → HMAC-signed token `<payloadB64>.<sigB64>` where payload is
//     JSON `{ uid, exp }`. Stored in an HttpOnly cookie. No DB session table
//     needed; tampering is rejected by the signature check.
//
// SESSION_SECRET should be set in production; we fall back to a dev default so
// the app runs out of the box (clearly insecure — flagged in the report).

const SECRET = process.env.SESSION_SECRET || 'career-ops-dev-secret-change-me';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const SESSION_COOKIE = 'career_ops_session';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, saltHex, hashHex] = stored.split('$');
    if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sign(payloadB64: string): string {
  return b64url(crypto.createHmac('sha256', SECRET).update(payloadB64).digest());
}

export function signSession(userId: string): string {
  const payload = { uid: userId, exp: Date.now() + SESSION_TTL_MS };
  const payloadB64 = b64url(Buffer.from(JSON.stringify(payload)));
  return `${payloadB64}.${sign(payloadB64)}`;
}

/** Returns the userId if the token is valid and unexpired, else null. */
export function verifySession(token: string | undefined): string | null {
  if (!token) return null;
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return null;
  const expectedSig = sign(payloadB64);
  // Constant-time signature comparison.
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8')) as {
      uid: string;
      exp: number;
    };
    if (!payload.uid || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload.uid;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_TTL_MS / 1000);
