import "server-only";
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { toSqft } from "./area";
import { generateTitle, slugify, titleToSlug } from "./slug";

export { monthlyFrom, containsSaleLanguage } from "./rent-rules";

export async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = base || "rental-property";
  let slug = root;
  for (let n = 2; n < 500; n++) {
    const clash = await prisma.property.findUnique({ where: { slug }, select: { id: true } });
    const redirectClash = await prisma.slugRedirect.findUnique({ where: { oldSlug: slug }, select: { propertyId: true } });
    if ((!clash || clash.id === excludeId) && (!redirectClash || redirectClash.propertyId === excludeId)) return slug;
    slug = `${root}-${n}`;
  }
  return `${root}-${Date.now()}`;
}

export async function buildTitleAndSlug(input: {
  title?: string;
  propertyTypeId: string;
  locationId: string;
  area: number;
  areaUnit: "MARLA" | "KANAL" | "SQFT" | "SQYD";
  bedrooms?: number | null;
  excludeId?: string;
}) {
  const [type, loc] = await Promise.all([
    prisma.propertyType.findUnique({ where: { id: input.propertyTypeId } }),
    prisma.location.findUnique({ where: { id: input.locationId } }),
  ]);
  if (!type || !type.active) throw new Error("Invalid property type");
  if (!loc || !loc.active) throw new Error("Invalid location");
  const title =
    input.title?.trim() ||
    generateTitle({ typeName: type.name, typeSlug: type.slug, area: input.area, areaUnit: input.areaUnit, bedrooms: input.bedrooms, locationName: loc.name });
  return { title, baseSlug: titleToSlug(title), type, loc, areaSqft: toSqft(input.area, input.areaUnit) };
}

/** When a published listing's slug changes, keep the old URL working via a 301. */
export async function changeSlug(propertyId: string, oldSlug: string, newSlug: string, everPublished: boolean) {
  if (oldSlug === newSlug) return;
  if (everPublished) {
    await prisma.slugRedirect.upsert({ where: { oldSlug }, create: { oldSlug, propertyId }, update: { propertyId } });
  }
  // A listing may reclaim one of its own old slugs
  await prisma.slugRedirect.deleteMany({ where: { oldSlug: newSlug, propertyId } });
}

/**
 * Refresh cached pages after a listing changes.
 *
 * Property and agent pages are ISR-cached on first request. Next.js only attaches the
 * per-URL tag to such on-demand pages in some cases, so we invalidate by *route pattern*
 * (always attached) — this reliably drops stale "available" pages of rented, expired or
 * deleted listings (and cached 404s of newly published ones). Pages are re-cached on their
 * next visit, so caching still applies between changes.
 */
export function revalidateListing(slugs?: string | string[], _opts: { allProperties?: boolean } = {}) {
  void _opts;
  revalidatePath("/", "page");
  revalidatePath("/rent/[[...segments]]", "page");
  revalidatePath("/areas", "page");
  revalidatePath("/agents", "page");
  revalidatePath("/agents/[slug]", "page");
  revalidatePath("/property/[slug]", "page");
  for (const slug of [slugs ?? []].flat()) revalidatePath(`/property/${slug}`);
}

/** Current slug plus every old slug that redirects to this listing. */
export async function allSlugsFor(propertyId: string): Promise<string[]> {
  const p = await prisma.property.findUnique({ where: { id: propertyId }, select: { slug: true, slugRedirects: { select: { oldSlug: true } } } });
  return p ? [p.slug, ...p.slugRedirects.map((r) => r.oldSlug)] : [];
}
export { slugify };
