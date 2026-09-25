import "server-only";
import { headers } from "next/headers";

/**
 * Simple fixed-window in-memory rate limiter. On serverless platforms each instance keeps
 * its own window, which is still an effective brake on abuse of forms and auth endpoints.
 * For strict global limits, swap the store for Redis/Upstash (same interface).
 */
const buckets = new Map<string, { count: number; reset: number }>();

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim();
}

export async function rateLimit(action: string, limit: number, windowMs: number, key?: string): Promise<boolean> {
  const id = `${action}:${key ?? (await clientIp())}`;
  const now = Date.now();
  const b = buckets.get(id);
  if (!b || b.reset < now) {
    buckets.set(id, { count: 1, reset: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    }
    return true;
  }
  b.count++;
  return b.count <= limit;
}
