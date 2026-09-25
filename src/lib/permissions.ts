import "server-only";
import { prisma } from "./db";
import type { CurrentUser } from "./auth";

/** Admins can edit everything; other users only listings attached to their own agent profile. */
export async function canEditProperty(user: CurrentUser | null, propertyId: string) {
  if (!user) return null;
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, slug: true, status: true, publishedAt: true, agent: { select: { userId: true } } },
  });
  if (!property) return null;
  if (user.role === "ADMIN" || property.agent.userId === user.id) return property;
  return null;
}
