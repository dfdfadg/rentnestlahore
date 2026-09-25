"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { listingHref, type SearchFilters } from "@/lib/search-params";
import { track } from "@/lib/analytics";
import { BED_OPTIONS, RENT_OPTIONS, shortPKR, type LocationOption, type TypeOption } from "./options";

const SIZE_OPTIONS = [
  { label: "3+ Marla", value: 3, unit: "marla" },
  { label: "5+ Marla", value: 5, unit: "marla" },
  { label: "7+ Marla", value: 7, unit: "marla" },
  { label: "10+ Marla", value: 10, unit: "marla" },
  { label: "1+ Kanal", value: 1, unit: "kanal" },
  { label: "2+ Kanal", value: 2, unit: "kanal" },
];

export function HeroSearch({ types, locations }: { types: TypeOption[]; locations: LocationOption[] }) {
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const s = (k: string) => (fd.get(k) ? String(fd.get(k)) : undefined);
    const size = s("size") ? SIZE_OPTIONS[Number(s("size"))] : undefined;
    const f: SearchFilters = {
      type: s("type"),
      area: s("area"),
      minPrice: s("min_price") ? Number(s("min_price")) : undefined,
      maxPrice: s("max_price") ? Number(s("max_price")) : undefined,
      beds: s("beds") ? Number(s("beds")) : undefined,
      minArea: size?.value,
      unit: size?.unit,
    };
    if (f.minPrice && f.maxPrice && f.minPrice > f.maxPrice) [f.minPrice, f.maxPrice] = [f.maxPrice, f.minPrice];
    track("rental_search", { type: f.type ?? "all", area: f.area ?? "lahore", source: "home_hero" });
    router.push(listingHref(f));
  }

  return (
    <form onSubmit={onSubmit} method="get" action="/rent/" role="search" aria-label="Search rentals" className="rounded-2xl bg-white p-3 shadow-lift sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.3fr_1fr_1fr_0.8fr_0.9fr_auto]">
        <Select name="type" label="Property type">
          <option value="">All types</option>
          {types.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
        </Select>
        <Select name="area" label="Location / area">
          <option value="">All of Lahore</option>
          {locations.map((l) => <option key={l.slug} value={l.slug}>{l.depth ? `  ${l.name}` : l.name}</option>)}
        </Select>
        <Select name="min_price" label="Min rent">
          <option value="">No min</option>
          {RENT_OPTIONS.map((v) => <option key={v} value={v}>PKR {shortPKR(v)}</option>)}
        </Select>
        <Select name="max_price" label="Max rent">
          <option value="">No max</option>
          {RENT_OPTIONS.map((v) => <option key={v} value={v}>PKR {shortPKR(v)}</option>)}
        </Select>
        <Select name="beds" label="Bedrooms">
          <option value="">Any</option>
          {BED_OPTIONS.map((b) => <option key={b} value={b}>{b}+</option>)}
        </Select>
        <Select name="size" label="Area">
          <option value="">Any size</option>
          {SIZE_OPTIONS.map((o, i) => <option key={o.label} value={i}>{o.label}</option>)}
        </Select>
        <button type="submit" className="btn-primary h-full min-h-12 self-end px-6 text-base sm:col-span-2 lg:col-span-1">
          <Search className="h-5 w-5" /> Search Rentals
        </button>
      </div>
    </form>
  );
}

function Select({ name, label, children }: { name: string; label: string; children: React.ReactNode }) {
  const id = `hero-${name}`;
  return (
    <div className="rounded-xl bg-ink-50 px-3 pt-2 ring-1 ring-ink-100 focus-within:ring-2 focus-within:ring-ink-300">
      <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</label>
      <select id={id} name={name} className="w-full cursor-pointer bg-transparent pb-2 pt-0.5 text-sm font-medium text-ink-900 focus:outline-none">
        {children}
      </select>
    </div>
  );
}
