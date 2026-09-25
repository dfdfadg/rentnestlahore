import "server-only";
import { revalidatePath } from "next/cache";
import type { PriceFrequency } from "@prisma/client";
import { prisma } from "./db";
import { toSqft } from "./area";
import { generateTitle, slugify, titleToSlug } from "./slug";

export function monthlyFrom(price: number, freq: PriceFrequency): number {
  return freq === "YEARLY" ? Math.round(price / 12) : freq === "QUARTERLY" ? Math.round(price / 3) : price;
}

/** Rent-only guard: listings may never be advertised for sale. */
const SALE_WORDS = /\b(for\s+sale|on\s+sale|sale\s+price|sold|buy|purchase|installments?\s+plan|possession\s+for\s+sale)\b/i;
export function containsSaleLanguage(...texts: (string | null | undefined)[]): boolean {
  return texts.some((t) => !!t && SALE_WORDS.test(t));
}

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

export function revalidateListing(slug?: string) {
  revalidatePath("/", "page");
  revalidatePath("/rent/[[...segments]]", "page");
  if (slug) revalidatePath(`/property/${slug}/`);
}

export { slugify };
