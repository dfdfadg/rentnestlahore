import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { toSqft } from "./area";
import { PAGE_SIZE } from "./site";
import {
  CONDITION_PARAM,
  FURNISHED_PARAM,
  UNIT_PARAM,
  type SearchFilters,
} from "./search-params";
import { descendantIds, getAmenities, getLocations, resolveLandingType, resolveLocation } from "./taxonomy";

/**
 * A listing is publicly "active" only when it is a published RENT listing that has not expired.
 * Rented, expired, draft, pending and rejected listings never appear in search.
 */
export function activeWhere(now = new Date()): Prisma.PropertyWhereInput {
  return {
    purpose: "RENT",
    status: "PUBLISHED",
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };
}

export const cardSelect = {
  id: true,
  slug: true,
  title: true,
  price: true,
  priceFrequency: true,
  monthlyRent: true,
  area: true,
  areaUnit: true,
  bedrooms: true,
  bathrooms: true,
  furnished: true,
  featured: true,
  verified: true,
  isDemo: true,
  status: true,
  society: true,
  publishedAt: true,
  createdAt: true,
  location: { select: { name: true, slug: true } },
  propertyType: { select: { name: true, slug: true, pluralSlug: true } },
  images: { select: { url: true, alt: true }, orderBy: { position: "asc" }, take: 1 },
} satisfies Prisma.PropertySelect;

export type PropertyCardData = Prisma.PropertyGetPayload<{ select: typeof cardSelect }>;

export function orderByFor(sort: SearchFilters["sort"]): Prisma.PropertyOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest":
      return [{ publishedAt: "asc" }, { id: "asc" }];
    case "price_asc":
      return [{ monthlyRent: "asc" }, { id: "asc" }];
    case "price_desc":
      return [{ monthlyRent: "desc" }, { id: "asc" }];
    case "area_asc":
      return [{ areaSqft: "asc" }, { id: "asc" }];
    case "area_desc":
      return [{ areaSqft: "desc" }, { id: "asc" }];
    default:
      return [{ publishedAt: "desc" }, { id: "desc" }];
  }
}

/** Build the Prisma where clause for a set of filters. Unknown type/area slugs yield `null` (→ 404). */
export async function buildSearchWhere(f: SearchFilters): Promise<Prisma.PropertyWhereInput | null> {
  const and: Prisma.PropertyWhereInput[] = [activeWhere()];

  if (f.type) {
    const landing = await resolveLandingType(f.type);
    if (!landing) return null;
    and.push({ propertyTypeId: { in: landing.typeIds } });
  }
  if (f.area) {
    const loc = await resolveLocation(f.area);
    if (!loc) return null;
    const all = await getLocations();
    and.push({ locationId: { in: descendantIds(loc.id, all) } });
  }
  if (f.q) {
    and.push({
      OR: [
        { title: { contains: f.q, mode: "insensitive" } },
        { society: { contains: f.q, mode: "insensitive" } },
        { address: { contains: f.q, mode: "insensitive" } },
        { location: { name: { contains: f.q, mode: "insensitive" } } },
      ],
    });
  }
  if (f.minPrice != null || f.maxPrice != null) {
    and.push({ monthlyRent: { gte: f.minPrice, lte: f.maxPrice } });
  }
  if (f.beds != null) and.push({ bedrooms: { gte: f.beds } });
  if (f.baths != null) and.push({ bathrooms: { gte: f.baths } });
  if (f.minArea != null || f.maxArea != null) {
    const unit = UNIT_PARAM[f.unit ?? "marla"];
    and.push({
      areaSqft: {
        gte: f.minArea != null ? toSqft(f.minArea, unit) : undefined,
        lte: f.maxArea != null ? toSqft(f.maxArea, unit) : undefined,
      },
    });
  }
  if (f.furnished) and.push({ furnished: FURNISHED_PARAM[f.furnished] });
  if (f.condition) and.push({ condition: CONDITION_PARAM[f.condition] });
  if (f.amenities?.length) {
    const known = new Set((await getAmenities()).map((a) => a.slug));
    for (const slug of f.amenities) {
      if (known.has(slug)) and.push({ amenities: { some: { slug } } });
    }
  }
  if (f.floor != null) and.push({ floor: f.floor });
  if (f.mainRoad) and.push({ mainRoad: true });
  if (f.corner) and.push({ corner: true });
  if (f.minFront != null) and.push({ frontFt: { gte: f.minFront } });
  if (f.loading) and.push({ loadingArea: true });
  if (f.minHeight != null) and.push({ ceilingHeightFt: { gte: f.minHeight } });
  if (f.verified) and.push({ verified: true });

  return { AND: and };
}

export async function searchProperties(f: SearchFilters, page = 1, pageSize = PAGE_SIZE) {
  const where = await buildSearchWhere(f);
  if (!where) return null;
  const [total, items] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      select: cardSelect,
      orderBy: orderByFor(f.sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { total, items, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function countActive(where: Prisma.PropertyWhereInput = {}) {
  return prisma.property.count({ where: { AND: [activeWhere(), where] } });
}

export async function getFeaturedProperties(take = 8) {
  const now = new Date();
  return prisma.property.findMany({
    where: { AND: [activeWhere(now), { featured: true }, { OR: [{ featuredUntil: null }, { featuredUntil: { gt: now } }] }] },
    select: cardSelect,
    orderBy: [{ publishedAt: "desc" }],
    take,
  });
}

export async function getLatestProperties(take = 8, where: Prisma.PropertyWhereInput = {}) {
  return prisma.property.findMany({
    where: { AND: [activeWhere(), where] },
    select: cardSelect,
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take,
  });
}

export const detailInclude = {
  propertyType: true,
  location: { include: { parent: true } },
  amenities: { orderBy: { sortOrder: "asc" } },
  images: { orderBy: { position: "asc" } },
  agent: {
    select: {
      id: true, slug: true, name: true, agency: true, type: true, imageUrl: true, phone: true,
      whatsapp: true, verified: true, isDemo: true, userId: true,
    },
  },
} satisfies Prisma.PropertyInclude;

export type PropertyDetail = Prisma.PropertyGetPayload<{ include: typeof detailInclude }>;

export async function getPropertyBySlug(slug: string) {
  return prisma.property.findUnique({ where: { slug }, include: detailInclude });
}

/**
 * Similar rentals: same landing type, same area (or same parent area), rent within ±40%,
 * then ranked by closeness in rent, bedrooms and size. Never random.
 */
export async function getSimilarProperties(p: PropertyDetail, take = 6) {
  const all = await getLocations();
  const areaRootId = p.location.parentId ?? p.locationId;
  const areaIds = descendantIds(areaRootId, all);
  const candidates = await prisma.property.findMany({
    where: {
      AND: [
        activeWhere(),
        { id: { not: p.id } },
        { propertyTypeId: p.propertyTypeId },
        { monthlyRent: { gte: Math.floor(p.monthlyRent * 0.6), lte: Math.ceil(p.monthlyRent * 1.4) } },
        { OR: [{ locationId: { in: areaIds } }, { location: { parentId: areaRootId } }] },
      ],
    },
    select: { ...cardSelect, locationId: true, areaSqft: true },
    take: 40,
  });
  let pool = candidates;
  if (pool.length < take) {
    // Fall back to same type anywhere in Lahore within the rent band.
    const extra = await prisma.property.findMany({
      where: {
        AND: [
          activeWhere(),
          { id: { notIn: [p.id, ...pool.map((c) => c.id)] } },
          { propertyTypeId: p.propertyTypeId },
          { monthlyRent: { gte: Math.floor(p.monthlyRent * 0.5), lte: Math.ceil(p.monthlyRent * 1.5) } },
        ],
      },
      select: { ...cardSelect, locationId: true, areaSqft: true },
      take: 20,
    });
    pool = [...pool, ...extra];
  }
  const score = (c: (typeof pool)[number]) =>
    (c.locationId === p.locationId ? 0 : areaIds.includes(c.locationId) ? 1 : 3) +
    Math.abs(c.monthlyRent - p.monthlyRent) / Math.max(p.monthlyRent, 1) * 4 +
    Math.abs((c.bedrooms ?? 0) - (p.bedrooms ?? 0)) * 0.6 +
    Math.abs(c.areaSqft - p.areaSqft) / Math.max(p.areaSqft, 1) * 2;
  return pool.sort((a, b) => score(a) - score(b)).slice(0, take);
}

/** Counts of active listings grouped by property type id, optionally within a set of locations. */
export async function countByType(locationIds?: string[]) {
  const rows = await prisma.property.groupBy({
    by: ["propertyTypeId"],
    where: { AND: [activeWhere(), locationIds ? { locationId: { in: locationIds } } : {}] },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.propertyTypeId, r._count._all]));
}

export async function countByLocation() {
  const rows = await prisma.property.groupBy({
    by: ["locationId"],
    where: activeWhere(),
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.locationId, r._count._all]));
}

/** Roll up child-location counts into their parents (DHA phases -> DHA Lahore). */
export async function countByLocationRollup() {
  const [direct, all] = await Promise.all([countByLocation(), getLocations()]);
  const out = new Map<string, number>();
  for (const loc of all) {
    let total = 0;
    for (const id of descendantIds(loc.id, all)) total += direct.get(id) ?? 0;
    out.set(loc.id, total);
  }
  return out;
}
