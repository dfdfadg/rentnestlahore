"use client";

import { useRouter } from "next/navigation";
import { SORT_OPTIONS, listingHref, type SearchFilters, type SortValue } from "@/lib/search-params";

export function SortSelect({ filters }: { filters: SearchFilters }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm text-ink-600">
      <span className="hidden sm:inline">Sort by</span>
      <select
        className="input min-h-10 w-auto py-1.5 pr-8"
        value={filters.sort ?? "newest"}
        aria-label="Sort rentals"
        onChange={(e) => router.push(listingHref({ ...filters, sort: e.target.value as SortValue }))}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
