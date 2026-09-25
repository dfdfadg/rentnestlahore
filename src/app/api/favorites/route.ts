import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { activeWhere } from "@/lib/properties";
import { rateLimit } from "@/lib/rate-limit";

const body = z.object({ propertyId: z.string().min(1).max(40) });

async function handle(req: Request, add: boolean) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  if (!(await rateLimit("favorite", 120, 60_000, user.id))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { propertyId } = parsed.data;
  if (add) {
    const exists = await prisma.property.findFirst({ where: { AND: [{ id: propertyId }, activeWhere()] }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Property not available" }, { status: 404 });
    await prisma.favorite.upsert({
      where: { userId_propertyId: { userId: user.id, propertyId } },
      create: { userId: user.id, propertyId },
      update: {},
    });
  } else {
    await prisma.favorite.deleteMany({ where: { userId: user.id, propertyId } });
  }
  return NextResponse.json({ ok: true, saved: add });
}

export async function POST(req: Request) {
  return handle(req, true);
}

export async function DELETE(req: Request) {
  return handle(req, false);
}
