/**
 * Pure (DB-free) parsing and serialisation of rental search filters.
 * Shared by server pages and client filter components.
 */
import type { AreaUnit, FurnishedStatus, PropertyCondition } from "@prisma/client";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_asc", label: "Rent: Low to High" },
  { value: "price_desc", label: "Rent: High to Low" },
  { value: "area_asc", label: "Area: Small to Large" },
  { value: "area_desc", label: "Area: Large to Small" },
] as const;
export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const UNIT_PARAM: Record<string, AreaUnit> = { marla: "MARLA", kanal: "KANAL", sqft: "SQFT", sqyd: "SQYD" };
export const FURNISHED_PARAM: Record<string, FurnishedStatus> = {
  furnished: "FURNISHED",
  "semi-furnished": "SEMI_FURNISHED",
  unfurnished: "UNFURNISHED",
};
export const CONDITION_PARAM: Record<string, PropertyCondition> = {
  "brand-new": "BRAND_NEW",
  renovated: "RENOVATED",
  used: "USED",
};

export type SearchFilters = {
  type?: string; // landing-type slug e.g. "houses"
  area?: string; // location slug e.g. "dha-phase-6"
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  minArea?: number;
  maxArea?: number;
  unit?: string; // marla | kanal | sqft | sqyd
  furnished?: string;
  condition?: string;
  amenities?: string[];
  floor?: number;
  mainRoad?: boolean;
  corner?: boolean;
  minFront?: number;
  loading?: boolean;
  minHeight?: number;
  verified?: boolean;
  sort?: SortValue;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  const t = s?.trim();
  return t ? t : undefined;
}

function num(v: string | string[] | undefined, { min = 0, max = 1e10, int = true } = {}): number | undefined {
  const s = first(v);
  if (!s) return undefined;
  const n = Number(s.replace(/,/g, ""));
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  return int ? Math.floor(n) : n;
}

function bool(v: string | string[] | undefined): boolean | undefined {
  const s = first(v);
  return s === "1" || s === "true" || s === "yes" ? true : undefined;
}

const SLUG_RE = /^[a-z0-9-]{1,80}$/;

export function parseSearchParams(raw: RawParams): SearchFilters {
  const f: SearchFilters = {};
  const type = first(raw.type);
  if (type && SLUG_RE.test(type)) f.type = type;
  const area = first(raw.area);
  if (area && SLUG_RE.test(area)) f.area = area;
  const q = first(raw.q);
  if (q) f.q = q.slice(0, 80);
  f.minPrice = num(raw.min_price, { max: 1e9 });
  f.maxPrice = num(raw.max_price, { max: 1e9 });
  if (f.minPrice && f.maxPrice && f.minPrice > f.maxPrice) [f.minPrice, f.maxPrice] = [f.maxPrice, f.minPrice];
  f.beds = num(raw.beds, { min: 1, max: 20 });
  f.baths = num(raw.baths, { min: 1, max: 20 });
  f.minArea = num(raw.min_area, { max: 1e7, int: false });
  f.maxArea = num(raw.max_area, { max: 1e7, int: false });
  if (f.minArea && f.maxArea && f.minArea > f.maxArea) [f.minArea, f.maxArea] = [f.maxArea, f.minArea];
  const unit = first(raw.unit);
  if (unit && unit in UNIT_PARAM) f.unit = unit;
  const furnished = first(raw.furnished);
  if (furnished && furnished in FURNISHED_PARAM) f.furnished = furnished;
  const condition = first(raw.condition);
  if (condition && condition in CONDITION_PARAM) f.condition = condition;
  const amenitiesRaw = Array.isArray(raw.amenities) ? raw.amenities.join(",") : raw.amenities;
  if (amenitiesRaw) {
    const list = [...new Set(amenitiesRaw.split(",").map((s) => s.trim()).filter((s) => SLUG_RE.test(s)))].slice(0, 16);
    if (list.length) f.amenities = list.sort();
  }
  f.floor = num(raw.floor, { min: -1, max: 100 });
  f.mainRoad = bool(raw.main_road);
  f.corner = bool(raw.corner);
  f.minFront = num(raw.min_front, { max: 1000, int: false });
  f.loading = bool(raw.loading);
  f.minHeight = num(raw.min_height, { max: 200, int: false });
  f.verified = bool(raw.verified);
  const sort = first(raw.sort);
  if (sort && SORT_OPTIONS.some((o) => o.value === sort)) f.sort = sort as SortValue;
  for (const k of Object.keys(f) as (keyof SearchFilters)[]) if (f[k] === undefined) delete f[k];
  return f;
}

/** Filters (other than type/area which live in the path) as URL query params, in a stable order. */
export function filtersToQuery(f: SearchFilters, opts: { includePathKeys?: boolean } = {}): URLSearchParams {
  const p = new URLSearchParams();
  if (opts.includePathKeys) {
    if (f.type) p.set("type", f.type);
    if (f.area) p.set("area", f.area);
  }
  if (f.q) p.set("q", f.q);
  if (f.minPrice != null) p.set("min_price", String(f.minPrice));
  if (f.maxPrice != null) p.set("max_price", String(f.maxPrice));
  if (f.beds != null) p.set("beds", String(f.beds));
  if (f.baths != null) p.set("baths", String(f.baths));
  if (f.minArea != null) p.set("min_area", String(f.minArea));
  if (f.maxArea != null) p.set("max_area", String(f.maxArea));
  if (f.unit && (f.minArea != null || f.maxArea != null)) p.set("unit", f.unit);
  if (f.furnished) p.set("furnished", f.furnished);
  if (f.condition) p.set("condition", f.condition);
  if (f.amenities?.length) p.set("amenities", f.amenities.join(","));
  if (f.floor != null) p.set("floor", String(f.floor));
  if (f.mainRoad) p.set("main_road", "1");
  if (f.corner) p.set("corner", "1");
  if (f.minFront != null) p.set("min_front", String(f.minFront));
  if (f.loading) p.set("loading", "1");
  if (f.minHeight != null) p.set("min_height", String(f.minHeight));
  if (f.verified) p.set("verified", "1");
  if (f.sort && f.sort !== "newest") p.set("sort", f.sort);
  return p;
}

/** True if any refinement beyond the path (type/location) is active. */
export function hasRefinements(f: SearchFilters): boolean {
  return filtersToQuery(f).toString().length > 0;
}

/** Canonical listing path: /rent/, /rent/houses/, /rent/dha-lahore/, /rent/dha-lahore/houses/, + /page/N/ */
export function listingPath(opts: { type?: string | null; area?: string | null; page?: number }): string {
  const parts = ["rent"];
  if (opts.area) parts.push(opts.area);
  if (opts.type) parts.push(opts.type);
  if (opts.page && opts.page > 1) parts.push("page", String(opts.page));
  return `/${parts.join("/")}/`;
}

export function listingHref(f: SearchFilters, page = 1): string {
  const qs = filtersToQuery(f).toString();
  return listingPath({ type: f.type, area: f.area, page }) + (qs ? `?${qs}` : "");
}
