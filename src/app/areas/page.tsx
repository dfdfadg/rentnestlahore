import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { countByLocationRollup } from "@/lib/properties";
import { getLocations } from "@/lib/taxonomy";
import { pageMetadata } from "@/lib/seo";
import { formatNumber } from "@/lib/format";

export const revalidate = 600;

export const metadata: Metadata = pageMetadata({
  title: "Lahore Areas — Rentals by Neighbourhood | RentNest Lahore",
  description: "Browse rental properties by Lahore area: DHA, Gulberg, Johar Town, Bahria Town, Model Town, Wapda Town and more. See how many rentals are live in each neighbourhood.",
  path: "/areas/",
});

export default async function AreasPage() {
  const [locations, counts] = await Promise.all([getLocations(), countByLocationRollup()]);
  const roots = locations.filter((l) => !l.parentId).sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) || a.name.localeCompare(b.name));
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Areas", path: "/areas/" }]} />
      <h1 className="mt-4 text-3xl font-extrabold">Rental areas in Lahore</h1>
      <p className="mt-2 max-w-2xl text-ink-600">Pick a neighbourhood to see its active rentals, a live rent snapshot and nearby alternatives.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roots.map((r) => {
          const children = locations.filter((l) => l.parentId === r.id);
          const n = counts.get(r.id) ?? 0;
          return (
            <section key={r.id} className="card flex flex-col p-5">
              <h2 className="flex items-center justify-between gap-2 text-lg font-bold">
                <Link href={`/rent/${r.slug}/`} className="flex items-center gap-2 hover:text-brick-700"><MapPin className="h-5 w-5 text-brick-500" />{r.name}</Link>
                <span className="text-sm font-medium text-ink-500">{formatNumber(n)} rentals</span>
              </h2>
              {r.description && <p className="mt-2 line-clamp-3 text-sm text-ink-600">{r.description}</p>}
              {children.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {children.map((c) => (
                    <li key={c.id}><Link href={`/rent/${c.slug}/`} className="badge bg-ink-50 px-2.5 py-1 text-ink-700 ring-1 ring-ink-100 hover:bg-ink-100">{c.name} ({counts.get(c.id) ?? 0})</Link></li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
