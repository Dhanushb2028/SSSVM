// In-memory login-attempt rate limiter, keyed by "identifier:ip".
// Single-instance dev/small-deployment scope — swap for a shared store (Redis)
// if this app is ever run behind multiple instances.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

type Bucket = { count: number; windowStartedAt: number; lockedUntil?: number };

const buckets = new Map<string, Bucket>();

function key(identifier: string, ip: string) {
  return `${identifier.toLowerCase()}:${ip}`;
}

export function isRateLimited(identifier: string, ip: string): boolean {
  const bucket = buckets.get(key(identifier, ip));
  if (!bucket) return false;
  if (bucket.lockedUntil && bucket.lockedUntil > Date.now()) return true;
  return false;
}

export function recordFailedAttempt(identifier: string, ip: string): void {
  const k = key(identifier, ip);
  const now = Date.now();
  const bucket = buckets.get(k);

  if (!bucket || now - bucket.windowStartedAt > WINDOW_MS) {
    buckets.set(k, { count: 1, windowStartedAt: now });
    return;
  }

  bucket.count += 1;
  if (bucket.count >= MAX_ATTEMPTS) {
    bucket.lockedUntil = now + LOCKOUT_MS;
  }
}

export function clearAttempts(identifier: string, ip: string): void {
  buckets.delete(key(identifier, ip));
}
