import type { AreaUnit } from "@prisma/client";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

const RESIDENTIAL_WITH_BEDROOMS = new Set(["flat", "apartment", "penthouse", "room"]);

/**
 * Natural rental titles, e.g.
 *  "5 Marla House for Rent in Johar Town"
 *  "3 Bedroom Flat for Rent in Gulberg"
 *  "Office for Rent in DHA Lahore"
 */
export function generateTitle(input: {
  typeName: string;
  typeSlug: string;
  area: number;
  areaUnit: AreaUnit;
  bedrooms?: number | null;
  locationName: string;
}): string {
  const { typeName, typeSlug, area, areaUnit, bedrooms, locationName } = input;
  let prefix = "";
  if (RESIDENTIAL_WITH_BEDROOMS.has(typeSlug) && bedrooms && typeSlug !== "room") {
    prefix = `${bedrooms} Bedroom `;
  } else if (areaUnit === "MARLA" || areaUnit === "KANAL") {
    const v = Number.isInteger(area) ? area : Number(area.toFixed(1));
    prefix = `${v} ${areaUnit === "MARLA" ? "Marla" : "Kanal"} `;
  }
  const prep = /\broad$/i.test(locationName) ? "on" : "in";
  return `${prefix}${typeName} for Rent ${prep} ${locationName}`.replace(/\s+/g, " ").trim();
}

/** URL slug for a listing title: "5 Marla House for Rent in Johar Town" -> "5-marla-house-for-rent-johar-town" */
export function titleToSlug(title: string): string {
  return slugify(title.replace(/\b(in|on)\b/gi, " "));
}
