"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { listingHref, type SearchFilters } from "@/lib/search-params";
import { track } from "@/lib/analytics";
import { BED_OPTIONS, FLOOR_OPTIONS, RENT_OPTIONS, shortPKR, type LocationOption, type TypeOption } from "./options";

type Props = {
  filters: SearchFilters;
  types: TypeOption[];
  locations: LocationOption[];
  amenities: { slug: string; name: string }[];
  resultCount: number;
};

/**
 * Rental filters. A plain GET form (works without JavaScript); with JavaScript the URL is
 * rebuilt into the clean canonical shape: /rent/<area>/<type>/?beds=3&min_price=...
 */
export function FilterForm({ filters, types, locations, amenities, resultCount }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(filters.type ?? "");
  const selectedType = types.find((t) => t.slug === type);
  const isCommercial = selectedType?.category === "COMMERCIAL";
  const showCommercial = !selectedType || isCommercial || selectedType.category === "MIXED";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => {
      const v = fd.get(k);
      return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
    };
    const numOrUndef = (k: string) => (get(k) != null ? Number(get(k)) : undefined);
    const next: SearchFilters = {
      type: get("type"),
      area: get("area"),
      q: get("q"),
      minPrice: numOrUndef("min_price"),
      maxPrice: numOrUndef("max_price"),
      beds: numOrUndef("beds"),
      baths: numOrUndef("baths"),
      minArea: numOrUndef("min_area"),
      maxArea: numOrUndef("max_area"),
      unit: get("unit"),
      furnished: get("furnished"),
      condition: get("condition"),
      amenities: fd.getAll("amenities").map(String).filter(Boolean).sort(),
      floor: numOrUndef("floor"),
      mainRoad: fd.get("main_road") === "1" || undefined,
      corner: fd.get("corner") === "1" || undefined,
      minFront: numOrUndef("min_front"),
      loading: fd.get("loading") === "1" || undefined,
      minHeight: numOrUndef("min_height"),
      verified: fd.get("verified") === "1" || undefined,
      sort: filters.sort,
    };
    if (next.minPrice && next.maxPrice && next.minPrice > next.maxPrice) [next.minPrice, next.maxPrice] = [next.maxPrice, next.minPrice];
    track("filter_apply", {
      type: next.type ?? "all",
      area: next.area ?? "lahore",
      filters: Object.entries(next).filter(([, v]) => v !== undefined && !(Array.isArray(v) && !v.length)).length,
    });
    setOpen(false);
    router.push(listingHref(next));
  }

  const priceOptions = (current?: number) => {
    const list = current && !RENT_OPTIONS.includes(current) ? [...RENT_OPTIONS, current].sort((a, b) => a - b) : RENT_OPTIONS;
    return list.map((v) => (
      <option key={v} value={v}>PKR {shortPKR(v)}</option>
    ));
  };

  return (
    <>
      {/* Sticky mobile filter button */}
      <div className="sticky top-16 z-30 -mx-4 border-b border-ink-100 bg-sand-50/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <button type="button" className="btn-dark w-full" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="rental-filters">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <form
        id="rental-filters"
        method="get"
        action="/rent/"
        onSubmit={onSubmit}
        aria-label="Rental filters"
        className={`${open ? "fixed inset-y-0 right-0 z-50 flex w-[min(420px,100%)] flex-col bg-white shadow-lift" : "hidden"} lg:sticky lg:top-20 lg:z-auto lg:flex lg:max-h-[calc(100dvh-6rem)] lg:w-auto lg:flex-col lg:rounded-2xl lg:border lg:border-ink-100 lg:bg-white lg:shadow-card`}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="text-base font-bold">Filter rentals</h2>
          <button type="button" className="btn-ghost -mr-2 px-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Close filters">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <Field label="Keyword" htmlFor="f-q">
            <input id="f-q" name="q" defaultValue={filters.q} placeholder="e.g. Block E, corner" className="input" maxLength={80} />
          </Field>

          <Field label="Property type" htmlFor="f-type">
            <select id="f-type" name="type" value={type} onChange={(e) => setType(e.target.value)} className="input">
              <option value="">All property types</option>
              <optgroup label="Residential">
                {types.filter((t) => t.category === "RESIDENTIAL").map((t) => (
                  <option key={t.slug} value={t.slug}>{t.name}</option>
                ))}
              </optgroup>
              <optgroup label="Commercial">
                {types.filter((t) => t.category === "COMMERCIAL").map((t) => (
                  <option key={t.slug} value={t.slug}>{t.name}</option>
                ))}
              </optgroup>
            </select>
          </Field>

          <Field label="Location / area" htmlFor="f-area">
            <select id="f-area" name="area" defaultValue={filters.area ?? ""} className="input">
              <option value="">All of Lahore</option>
              {locations.map((l) => (
                <option key={l.slug} value={l.slug}>{l.depth ? `   ${l.name}` : l.name}</option>
              ))}
            </select>
          </Field>

          <fieldset>
            <legend className="label">Monthly rent (PKR)</legend>
            <div className="grid grid-cols-2 gap-2">
              <select name="min_price" defaultValue={filters.minPrice ?? ""} className="input" aria-label="Minimum rent">
                <option value="">Min</option>
                {priceOptions(filters.minPrice)}
              </select>
              <select name="max_price" defaultValue={filters.maxPrice ?? ""} className="input" aria-label="Maximum rent">
                <option value="">Max</option>
                {priceOptions(filters.maxPrice)}
              </select>
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-2">
            {!isCommercial && (
              <Field label="Bedrooms" htmlFor="f-beds">
                <select id="f-beds" name="beds" defaultValue={filters.beds ?? ""} className="input">
                  <option value="">Any</option>
                  {BED_OPTIONS.map((b) => <option key={b} value={b}>{b}+</option>)}
                </select>
              </Field>
            )}
            <Field label="Bathrooms" htmlFor="f-baths">
              <select id="f-baths" name="baths" defaultValue={filters.baths ?? ""} className="input">
                <option value="">Any</option>
                {BED_OPTIONS.map((b) => <option key={b} value={b}>{b}+</option>)}
              </select>
            </Field>
          </div>

          <fieldset>
            <legend className="label">Area / size</legend>
            <div className="grid grid-cols-[1fr_1fr_1.1fr] gap-2">
              <input name="min_area" type="number" min={0} step="any" inputMode="decimal" defaultValue={filters.minArea ?? ""} placeholder="Min" className="input" aria-label="Minimum area" />
              <input name="max_area" type="number" min={0} step="any" inputMode="decimal" defaultValue={filters.maxArea ?? ""} placeholder="Max" className="input" aria-label="Maximum area" />
              <select name="unit" defaultValue={filters.unit ?? "marla"} className="input" aria-label="Area unit">
                <option value="marla">Marla</option>
                <option value="kanal">Kanal</option>
                <option value="sqft">Sq Ft</option>
                <option value="sqyd">Sq Yd</option>
              </select>
            </div>
          </fieldset>

          {!isCommercial && (
            <Field label="Furnishing" htmlFor="f-furnished">
              <select id="f-furnished" name="furnished" defaultValue={filters.furnished ?? ""} className="input">
                <option value="">Any</option>
                <option value="furnished">Furnished</option>
                <option value="semi-furnished">Semi Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </Field>
          )}

          <Field label="Property condition" htmlFor="f-condition">
            <select id="f-condition" name="condition" defaultValue={filters.condition ?? ""} className="input">
              <option value="">Any</option>
              <option value="brand-new">Brand New</option>
              <option value="renovated">Renovated</option>
              <option value="used">Used</option>
            </select>
          </Field>

          {showCommercial && (
            <details className="rounded-xl border border-ink-100 p-3" open={isCommercial || undefined}>
              <summary className="cursor-pointer text-sm font-semibold text-ink-800">Commercial filters</summary>
              <div className="mt-3 space-y-3">
                <Field label="Floor" htmlFor="f-floor">
                  <select id="f-floor" name="floor" defaultValue={filters.floor ?? ""} className="input">
                    <option value="">Any floor</option>
                    {FLOOR_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Min front (ft)" htmlFor="f-front">
                    <input id="f-front" name="min_front" type="number" min={0} inputMode="numeric" defaultValue={filters.minFront ?? ""} className="input" />
                  </Field>
                  <Field label="Min height (ft)" htmlFor="f-height">
                    <input id="f-height" name="min_height" type="number" min={0} inputMode="numeric" defaultValue={filters.minHeight ?? ""} className="input" title="Warehouse clear height" />
                  </Field>
                </div>
                <Check name="main_road" label="On main road" checked={filters.mainRoad} />
                <Check name="corner" label="Corner" checked={filters.corner} />
                <Check name="loading" label="Loading area" checked={filters.loading} />
              </div>
            </details>
          )}

          <fieldset>
            <legend className="label">Amenities</legend>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {amenities.map((a) => (
                <label key={a.slug} className="flex min-h-8 items-center gap-2 text-sm text-ink-700">
                  <input type="checkbox" name="amenities" value={a.slug} defaultChecked={filters.amenities?.includes(a.slug)} className="h-4 w-4 accent-brick-600" />
                  {a.name}
                </label>
              ))}
            </div>
          </fieldset>

          <Check name="verified" label="Verified properties only" checked={filters.verified} />
          {filters.sort && <input type="hidden" name="sort" value={filters.sort} />}
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-2 border-t border-ink-100 px-5 py-4">
          <a href={listingHref({ type: filters.type, area: filters.area })} className="btn-outline">Clear</a>
          <button type="submit" className="btn-primary">
            <span className="lg:hidden">Show {resultCount.toLocaleString("en-US")} results</span>
            <span className="hidden lg:inline">Apply filters</span>
          </button>
        </div>
      </form>
    </>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">{label}</label>
      {children}
    </div>
  );
}

function Check({ name, label, checked }: { name: string; label: string; checked?: boolean }) {
  return (
    <label className="flex min-h-8 items-center gap-2 text-sm text-ink-700">
      <input type="checkbox" name={name} value="1" defaultChecked={checked} className="h-4 w-4 accent-brick-600" />
      {label}
    </label>
  );
}
