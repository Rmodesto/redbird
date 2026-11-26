import { NextResponse } from 'next/server';

/**
 * Simple in-memory sliding-window rate limiter, keyed by client IP.
 *
 * Note: state is per server instance. Behind multiple instances each one
 * keeps its own counters, so this is a first line of defense, not a hard
 * global guarantee. Swap for Redis/Upstash if that ever matters.
 */

interface Bucket {
  timestamps: number[];
  // Each bucket remembers its own scope's window so cleanup prunes it against
  // the right span — never against whichever window happened to trigger it.
  windowMs: number;
}

const buckets = new Map<string, Bucket>();

// Periodically drop stale buckets so the map doesn't grow unbounded.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const entries = Array.from(buckets.entries());
  for (const [key, bucket] of entries) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < bucket.windowMs);
    if (bucket.timestamps.length === 0) {
      buckets.delete(key);
    }
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // X-Forwarded-For is client-appended on the left and proxy-appended on the
    // right. Behind a trusted proxy (Amplify/CloudFront) the rightmost entry is
    // the one the proxy observed; the leftmost is attacker-controlled and must
    // not be used as a rate-limit key.
    const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
  }
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * Returns null when the request is allowed, or a 429 response when the
 * client has exceeded `max` requests within `windowMs` for this `scope`.
 */
export function rateLimit(
  req: Request,
  scope: string,
  max: number,
  windowMs: number
): NextResponse | null {
  cleanup();

  const key = `${scope}:${getClientIp(req)}`;
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [], windowMs };
    buckets.set(key, bucket);
  } else {
    bucket.windowMs = windowMs;
  }

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= max) {
    const retryAfterSec = Math.ceil(
      (bucket.timestamps[0] + windowMs - now) / 1000
    );
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.max(retryAfterSec, 1)) },
      }
    );
  }

  bucket.timestamps.push(now);
  return null;
}
