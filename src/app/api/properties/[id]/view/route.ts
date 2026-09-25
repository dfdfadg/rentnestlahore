import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

/** Counts a listing view (one per IP per listing per 6 hours). */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[a-z0-9]{10,40}$/i.test(id)) return NextResponse.json({ ok: false }, { status: 400 });
  if (await rateLimit(`view:${id}`, 1, 6 * 3_600_000)) {
    await prisma.property.updateMany({ where: { id, status: "PUBLISHED" }, data: { views: { increment: 1 } } });
  }
  return NextResponse.json({ ok: true });
}
