import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null, favoriteIds: [] }, { headers: { "Cache-Control": "private, no-store" } });
  }
  const favs = await prisma.favorite.findMany({ where: { userId: user.id }, select: { propertyId: true } });
  return NextResponse.json(
    { user: { id: user.id, name: user.name, role: user.role }, favoriteIds: favs.map((f) => f.propertyId) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
