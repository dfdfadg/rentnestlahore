import "server-only";

/**
 * Defence-in-depth CSRF check for JSON/multipart API mutations: the Origin header (sent by all
 * modern browsers on POST/DELETE) must match the Host. Session cookies are also SameSite=Lax.
 * Server Actions have an equivalent check built into Next.js.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
