import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { activeWhere } from "@/lib/properties";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Returns the contact numbers for an active listing on demand, so phone numbers are not
 * embedded in page HTML (reduces scraping). Rate limited per IP.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!(await rateLimit("contact-reveal", 40, 10 * 60_000))) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }
  const p = await prisma.property.findFirst({
    where: { AND: [{ id }, activeWhere()] },
    select: { agent: { select: { phone: true, whatsapp: true } } },
  });
  if (!p) return NextResponse.json({ error: "Listing not available" }, { status: 404 });
  return NextResponse.json(
    { phone: p.agent.phone, whatsapp: p.agent.whatsapp || p.agent.phone },
    { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } },
  );
}
