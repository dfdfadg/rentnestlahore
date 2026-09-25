import "server-only";
import type { Prisma } from "@prisma/client";
import { getAmenities, getLocations, getPropertyTypes } from "./taxonomy";
import type { PropertyFormValues } from "@/components/manage/PropertyForm";

export async function getFormOptions() {
  const [types, locs, amenities] = await Promise.all([getPropertyTypes(), getLocations(), getAmenities()]);
  const roots = locs.filter((l) => !l.parentId).sort((a, b) => a.name.localeCompare(b.name));
  const locations: { id: string; name: string; depth: number }[] = [];
  for (const r of roots) {
    locations.push({ id: r.id, name: r.name, depth: 0 });
    for (const c of locs.filter((l) => l.parentId === r.id)) locations.push({ id: c.id, name: c.name, depth: 1 });
  }
  return {
    types: types.map((t) => ({ id: t.id, name: t.name, category: t.category })),
    locations,
    amenities: amenities.map((a) => ({ id: a.id, name: a.name })),
  };
}

type EditableProperty = Prisma.PropertyGetPayload<{ include: { amenities: { select: { id: true } } } }>;

export function propertyToFormValues(p: EditableProperty): PropertyFormValues {
  return {
    id: p.id,
    title: p.title,
    propertyTypeId: p.propertyTypeId,
    price: p.price,
    priceFrequency: p.priceFrequency,
    securityDeposit: p.securityDeposit,
    advanceMonths: p.advanceMonths,
    area: p.area,
    areaUnit: p.areaUnit,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    locationId: p.locationId,
    society: p.society,
    address: p.address,
    latitude: p.latitude,
    longitude: p.longitude,
    description: p.description,
    features: p.features,
    furnished: p.furnished,
    condition: p.condition,
    floor: p.floor,
    mainRoad: p.mainRoad,
    corner: p.corner,
    frontFt: p.frontFt,
    loadingArea: p.loadingArea,
    ceilingHeightFt: p.ceilingHeightFt,
    videoUrl: p.videoUrl,
    amenityIds: p.amenities.map((a) => a.id),
    agentId: p.agentId,
    status: p.status,
    featured: p.featured,
    verified: p.verified,
    expiresAt: p.expiresAt ? p.expiresAt.toISOString().slice(0, 10) : null,
    rejectionReason: p.rejectionReason,
  };
}
