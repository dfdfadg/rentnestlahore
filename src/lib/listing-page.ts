import "server-only";
import { notFound, permanentRedirect } from "next/navigation";
import { getAmenities, getLandingTypes, getLocations, resolveLandingType, resolveLocation, locationLabel, type LandingType, type LocationRow } from "./taxonomy";
import type { LocationOption, TypeOption } from "@/components/search/options";

export type ListingContext = {
  landing: LandingType | null;
  location: LocationRow | null;
  parentLocation: LocationRow | null;
  page: number;
};

/**
 * /rent/                         hub
 * /rent/<type>/                  e.g. /rent/houses/
 * /rent/<area>/                  e.g. /rent/dha-lahore/
 * /rent/<area>/<type>/           e.g. /rent/dha-lahore/houses/
 * ... + /page/<n>/ on any of the above
 */
export async function resolveListingSegments(segments: string[] = []): Promise<ListingContext> {
  let segs = [...segments];
  let page = 1;
  if (segs.length >= 2 && segs[segs.length - 2] === "page") {
    const n = segs[segs.length - 1];
    if (!/^\d{1,5}$/.test(n) || Number(n) < 1) notFound();
    if (Number(n) === 1) permanentRedirect(`/${["rent", ...segs.slice(0, -2)].join("/")}/`);
    page = Number(n);
    segs = segs.slice(0, -2);
  }
  if (segs.length > 2) notFound();
  let landing: LandingType | null = null;
  let location: LocationRow | null = null;
  if (segs.length === 1) {
    const all = await getLandingTypes();
    landing = all.find((l) => l.slug === segs[0]) ?? null;
    if (!landing) location = await resolveLocation(segs[0]);
    if (!landing && !location) notFound();
  } else if (segs.length === 2) {
    location = await resolveLocation(segs[0]);
    const all = await getLandingTypes();
    landing = all.find((l) => l.slug === segs[1]) ?? null;
    if (!location || !landing) notFound();
  }
  let parentLocation: LocationRow | null = null;
  if (location?.parentId) parentLocation = (await getLocations()).find((l) => l.id === location!.parentId) ?? null;
  return { landing, location, parentLocation, page };
}

export function listingHeadings(ctx: ListingContext) {
  const typeName = ctx.landing?.pluralName ?? "Properties";
  const locName = ctx.location ? locationLabel(ctx.location) : "Lahore";
  const h1Loc = ctx.location ? (/lahore/i.test(ctx.location.name) ? ctx.location.name : `${ctx.location.name}, Lahore`) : "Lahore";
  return {
    h1: `${typeName} for Rent in ${h1Loc}`,
    titleBase: `${typeName} for Rent in ${locName}`,
    typeName,
    locName,
  };
}

export async function getFilterOptions(): Promise<{ types: TypeOption[]; locations: LocationOption[]; amenities: { slug: string; name: string }[] }> {
  const [landing, locs, amenities] = await Promise.all([getLandingTypes(), getLocations(), getAmenities()]);
  const types: TypeOption[] = landing.map((l) => ({ slug: l.slug, name: l.pluralName, category: l.category, isGroup: l.isGroup }));
  const roots = locs.filter((l) => !l.parentId).sort((a, b) => a.name.localeCompare(b.name));
  const locations: LocationOption[] = [];
  for (const r of roots) {
    locations.push({ slug: r.slug, name: r.name, depth: 0 });
    for (const c of locs.filter((l) => l.parentId === r.id).sort((a, b) => a.sortOrder - b.sortOrder)) {
      locations.push({ slug: c.slug, name: c.name, depth: 1 });
    }
  }
  return { types, locations, amenities: amenities.map((a) => ({ slug: a.slug, name: a.name })) };
}

export { resolveLandingType };
