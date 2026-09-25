import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!(await rateLimit("contact-reveal", 40, 10 * 60_000))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const agent = await prisma.agent.findUnique({ where: { slug }, select: { phone: true, whatsapp: true } });
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ phone: agent.phone, whatsapp: agent.whatsapp || agent.phone }, { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
}
