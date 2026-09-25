import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";
import { revalidateListing } from "@/lib/property-write";

export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return header.length === expected.length && timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

/**
 * Daily housekeeping (Vercel Cron, see vercel.json):
 *  - published listings past expiresAt -> EXPIRED
 *  - featured flags past featuredUntil are cleared
 *  - expired sessions and old reset tokens are deleted
 * Search already hides expired listings in real time; this keeps statuses tidy.
 */
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date();
  const [expired, unfeatured, sessions, tokens] = await Promise.all([
    prisma.property.updateMany({ where: { status: "PUBLISHED", expiresAt: { lt: now } }, data: { status: "EXPIRED", featured: false } }),
    prisma.property.updateMany({ where: { featured: true, featuredUntil: { lt: now } }, data: { featured: false, featuredUntil: null } }),
    prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.passwordResetToken.deleteMany({ where: { OR: [{ expiresAt: { lt: now } }, { usedAt: { not: null } }] } }),
  ]);
  if (expired.count || unfeatured.count) revalidateListing(undefined, { allProperties: true });
  return NextResponse.json({ expired: expired.count, unfeatured: unfeatured.count, sessionsDeleted: sessions.count, tokensDeleted: tokens.count });
}
