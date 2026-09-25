import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Crawlable pagination using real <a href> links. */
export function Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (p: number) => string }) {
  if (totalPages <= 1) return null;
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= totalPages - 2) [totalPages - 1, totalPages - 2, totalPages - 3].forEach((p) => pages.add(p));
  const list = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const base = "grid h-11 min-w-11 place-items-center rounded-xl px-3 text-sm font-semibold";
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={`${base} border border-ink-200 bg-white hover:bg-ink-50`} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : null}
      {list.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - list[i - 1] > 1 && <span className="px-1 text-ink-400">…</span>}
          {p === page ? (
            <span aria-current="page" className={`${base} bg-ink-900 text-white`}>{p}</span>
          ) : (
            <Link href={hrefFor(p)} className={`${base} border border-ink-200 bg-white hover:bg-ink-50`}>{p}</Link>
          )}
        </span>
      ))}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={`${base} border border-ink-200 bg-white hover:bg-ink-50`} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </nav>
  );
}
