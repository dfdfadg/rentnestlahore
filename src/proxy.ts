import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "rn_session";
const PROTECTED = ["/admin", "/dashboard", "/favorites", "/my-properties", "/my-enquiries", "/profile"];

/**
 * Fast pre-check: send signed-out visitors of private areas to the login page.
 * Real authorisation (session validity, roles, ownership) is enforced again on the server.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const res = isProtected && !req.cookies.get(SESSION_COOKIE)?.value
    ? NextResponse.redirect(new URL(`/login/?next=${encodeURIComponent(pathname + search)}`, req.url))
    : NextResponse.next();
  if (isProtected) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "private, no-store");
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/favorites/:path*", "/my-properties/:path*", "/my-enquiries/:path*", "/profile/:path*"],
};
