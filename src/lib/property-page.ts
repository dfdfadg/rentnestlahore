import "server-only";
import { countByType, getSimilarProperties, type PropertyDetail } from "./properties";
import { descendantIds, getLandingTypes, getLocations, locationLabel } from "./taxonomy";
import { listingPath } from "./search-params";

/** Supporting data for a property page: landing type, natural internal links and similar rentals. */
export async function propertyPageExtras(p: PropertyDetail) {
  const [landingAll, locations] = await Promise.all([getLandingTypes(), getLocations()]);
  const landing = landingAll.find((l) => !l.isGroup && l.typeIds.includes(p.propertyTypeId)) ?? null;
  const loc = p.location;
  const root = loc.parent ?? loc;
  const counts = await countByType(descendantIds(root.id, locations));
  const typeCount = (typeIds: string[]) => typeIds.reduce((s, id) => s + (counts.get(id) ?? 0), 0);

  const links: { href: string; label: string }[] = [];
  if (landing) {
    const n = typeCount(landing.typeIds);
    links.push(
      n >= 3
        ? { href: listingPath({ area: root.slug, type: landing.slug }), label: `${landing.pluralName} for rent in ${root.name}` }
        : { href: listingPath({ type: landing.slug }), label: `${landing.pluralName} for rent in Lahore` },
    );
  }
  links.push({ href: listingPath({ area: root.slug }), label: `All rentals in ${locationLabel(root)}` });
  if (loc.parent) links.push({ href: listingPath({ area: loc.slug }), label: `Rentals in ${loc.name}` });
  if (landing) links.push({ href: listingPath({ type: landing.slug }), label: `Browse all ${landing.pluralName.toLowerCase()}` });
  // Other popular types in the same area with real inventory
  for (const other of landingAll.filter((l) => !l.isGroup && l.slug !== landing?.slug && l.category === p.propertyType.category)) {
    if (typeCount(other.typeIds) >= 3) links.push({ href: listingPath({ area: root.slug, type: other.slug }), label: `${other.pluralName} in ${root.name}` });
    if (links.length >= 7) break;
  }
  const similar = await getSimilarProperties(p, 6);
  const areaIds = new Set(descendantIds(root.id, locations));
  const typeName = p.propertyType.pluralName.toLowerCase();
  const similarHeading = similar.every((s) => areaIds.has(s.locationId))
    ? `Similar ${typeName} for rent in ${root.name}`
    : `Similar ${typeName} for rent in Lahore`;
  return { landing, relatedLinks: links, similar, similarHeading };
}
