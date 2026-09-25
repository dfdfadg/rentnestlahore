import type { PropertyDetail } from "./properties";
import { absoluteUrl } from "./site";

const RESIDENCE_TYPE: Record<string, string> = {
  house: "House",
  "farm-house": "House",
  "upper-portion": "Accommodation",
  "lower-portion": "Accommodation",
  flat: "Apartment",
  apartment: "Apartment",
  penthouse: "Apartment",
  room: "Room",
};

/** schema.org RealEstateListing for a rental (lease) offer. */
export function propertyJsonLd(p: PropertyDetail) {
  const url = absoluteUrl(`/property/${p.slug}/`);
  const itemType = RESIDENCE_TYPE[p.propertyType.slug] ?? "Place";
  const item: Record<string, unknown> = {
    "@type": itemType,
    name: p.title,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      addressCountry: "PK",
      streetAddress: [p.society, p.location.name].filter(Boolean).join(", "),
    },
  };
  if (itemType !== "Place") {
    item.floorSize = { "@type": "QuantitativeValue", value: Math.round(p.areaSqft), unitCode: "FTK" };
    if (p.bedrooms) item.numberOfBedrooms = p.bedrooms;
    if (p.bathrooms) item.numberOfBathroomsTotal = p.bathrooms;
    item.amenityFeature = p.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a.name, value: true }));
  }
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    url,
    description: p.description.slice(0, 500),
    datePosted: (p.publishedAt ?? p.createdAt).toISOString(),
    image: p.images.slice(0, 6).map((i) => absoluteUrl(i.url)),
    offers: {
      "@type": "Offer",
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
      priceCurrency: "PKR",
      price: p.price,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: p.price,
        priceCurrency: "PKR",
        unitText: p.priceFrequency === "MONTHLY" ? "MONTH" : p.priceFrequency === "YEARLY" ? "YEAR" : "QUARTER",
      },
      seller: { "@type": "RealEstateAgent", name: p.agent.name, url: absoluteUrl(`/agents/${p.agent.slug}/`) },
    },
    about: item,
  };
}
