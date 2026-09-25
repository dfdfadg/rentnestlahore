import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "../JsonLd";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-ink-500">
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={c.path + i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />}
                {last ? (
                  <span aria-current="page" className="font-medium text-ink-800 line-clamp-1">{c.name}</span>
                ) : (
                  <Link href={c.path} className="hover:text-ink-900 hover:underline">{c.name}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
