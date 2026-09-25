import Link from "next/link";
import { SearchX } from "lucide-react";

export function EmptyResults({ clearHref, hasFilters }: { clearHref: string; hasFilters: boolean }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-brick-50 text-brick-600">
        <SearchX className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-xl font-bold">No rental properties found</h2>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        {hasFilters
          ? "No active rentals match all of your filters right now. Try widening your rent range or removing a filter."
          : "There are no active rentals here right now. New listings are added regularly — check back soon or explore nearby areas."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {hasFilters && <Link href={clearHref} className="btn-dark">Clear Filters</Link>}
        <Link href="/rent/" className="btn-outline">View All Rentals</Link>
        <Link href="/areas/" className="btn-outline">Try Another Area</Link>
      </div>
    </div>
  );
}
