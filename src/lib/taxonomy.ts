import { unstable_cache } from "next/cache";
import type { PropertyCategory } from "@prisma/client";
import { prisma } from "./db";

export type TypeRow = {
  id: string;
  name: string;
  slug: string;
  pluralName: string;
  pluralSlug: string;
  category: PropertyCategory;
  description: string | null;
};

export type LocationRow = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  isPopular: boolean;
  sortOrder: number;
};

export type AmenityRow = { id: string; name: string; slug: string; group: string };

export const TAXONOMY_TAG = "taxonomy";

export const getPropertyTypes = unstable_cache(
  async (): Promise<TypeRow[]> =>
    prisma.propertyType.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, pluralName: true, pluralSlug: true, category: true, description: true },
    }),
  ["property-types-v1"],
  { tags: [TAXONOMY_TAG], revalidate: 3600 },
);

export const getLocations = unstable_cache(
  async (): Promise<LocationRow[]> =>
    prisma.location.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true, name: true, slug: true, parentId: true, description: true,
        latitude: true, longitude: true, isPopular: true, sortOrder: true,
      },
    }),
  ["locations-v1"],
  { tags: [TAXONOMY_TAG], revalidate: 3600 },
);

export const getAmenities = unstable_cache(
  async (): Promise<AmenityRow[]> =>
    prisma.amenity.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, slug: true, group: true } }),
  ["amenities-v1"],
  { tags: [TAXONOMY_TAG], revalidate: 3600 },
);

/** A /rent/<slug>/ landing category: a single property type or a curated group of types. */
export type LandingType = {
  slug: string;
  pluralName: string;
  singularName: string;
  typeIds: string[];
  typeSlugs: string[];
  category: PropertyCategory | "MIXED";
  description: string | null;
  isGroup: boolean;
};

const GROUPS: { slug: string; pluralName: string; singularName: string; match: (t: TypeRow) => boolean; description: string; category: PropertyCategory }[] = [
  {
    slug: "portions",
    pluralName: "Portions",
    singularName: "Portion",
    match: (t) => t.slug === "upper-portion" || t.slug === "lower-portion",
    category: "RESIDENTIAL",
    description:
      "Upper and lower portions let you rent one floor of a house — usually with a separate entrance and meters — for less than the rent of an entire home. They are one of the most practical rental options for small families in Lahore.",
  },
  {
    slug: "commercial-properties",
    pluralName: "Commercial Properties",
    singularName: "Commercial Property",
    match: (t) => t.category === "COMMERCIAL",
    category: "COMMERCIAL",
    description:
      "Offices, shops, showrooms, warehouses, factories and entire commercial buildings for rent across Lahore. Filter by floor, main-road location, corner units, frontage, loading access and ceiling height to find space that fits your business.",
  },
];

/** Reserved first-level segments under /rent/ that can never be used as location slugs. */
export const RESERVED_RENT_SEGMENTS = new Set(["page", ...GROUPS.map((g) => g.slug)]);

export async function getLandingTypes(): Promise<LandingType[]> {
  const types = await getPropertyTypes();
  const singles: LandingType[] = types.map((t) => ({
    slug: t.pluralSlug,
    pluralName: t.pluralName,
    singularName: t.name,
    typeIds: [t.id],
    typeSlugs: [t.slug],
    category: t.category,
    description: t.description,
    isGroup: false,
  }));
  const groups: LandingType[] = GROUPS.map((g) => {
    const matched = types.filter(g.match);
    return {
      slug: g.slug,
      pluralName: g.pluralName,
      singularName: g.singularName,
      typeIds: matched.map((t) => t.id),
      typeSlugs: matched.map((t) => t.slug),
      category: g.category,
      description: g.description,
      isGroup: true,
    };
  }).filter((g) => g.typeIds.length > 0);
  return [...singles, ...groups];
}

export async function resolveLandingType(slug: string | undefined | null): Promise<LandingType | null> {
  if (!slug) return null;
  const all = await getLandingTypes();
  // Also accept singular type slugs ("house") for the ?type= parameter.
  return all.find((l) => l.slug === slug) ?? all.find((l) => !l.isGroup && l.typeSlugs[0] === slug) ?? null;
}

export async function resolveLocation(slug: string | undefined | null): Promise<LocationRow | null> {
  if (!slug) return null;
  const all = await getLocations();
  return all.find((l) => l.slug === slug) ?? null;
}

/** The location itself plus all of its descendants (e.g. DHA Lahore -> all DHA phases). */
export function descendantIds(locationId: string, all: LocationRow[]): string[] {
  const ids = [locationId];
  for (let i = 0; i < ids.length; i++) {
    for (const l of all) if (l.parentId === ids[i]) ids.push(l.id);
  }
  return ids;
}

export function locationLabel(loc: Pick<LocationRow, "name">): string {
  // Avoid "DHA Lahore Lahore" / "Bahria Town Lahore Lahore".
  return /lahore/i.test(loc.name) ? loc.name : `${loc.name} Lahore`;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Nearby top-level areas by distance (excludes the area's own children/parent chain). */
export function nearbyLocations(loc: LocationRow, all: LocationRow[], limit = 6): LocationRow[] {
  if (loc.latitude == null || loc.longitude == null) return [];
  const family = new Set(descendantIds(loc.id, all));
  if (loc.parentId) family.add(loc.parentId);
  return all
    .filter((l) => !family.has(l.id) && l.latitude != null && l.longitude != null && (!l.parentId || l.parentId === loc.parentId))
    .map((l) => ({ l, d: haversineKm({ lat: loc.latitude!, lng: loc.longitude! }, { lat: l.latitude!, lng: l.longitude! }) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => x.l);
}
