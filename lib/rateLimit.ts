/**
 * A small in-memory rate limiter for public API routes.
 *
 * Best effort by design: each serverless instance keeps its own counters, so a
 * determined caller spread across instances gets more than the limit. It is
 * there to stop casual abuse (a script hammering the Shiprocket-backed routes
 * and burning the account's API quota), not to be a security boundary — put a
 * real limiter (Upstash, Vercel Firewall) in front if that ever matters.
 */
import "server-only";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Keeps the map from growing without bound on a long-lived instance. */
const MAX_BUCKETS = 5000;

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** True when the caller is within the limit and this request has been counted. */
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= limit;
}
