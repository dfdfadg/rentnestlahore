import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { GUIDES } from "@/content/guides";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Lahore Rental Guides — Tips for Tenants | RentNest Lahore",
  description: "Practical guides for renting in Lahore: finding a house, costs, the best areas, rental agreements, documents and what to check before you sign.",
  path: "/guides/",
});

export default function GuidesPage() {
  const categories = [...new Set(GUIDES.map((g) => g.category))];
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Guides", path: "/guides/" }]} />
      <h1 className="mt-4 text-3xl font-extrabold">Rental guides for Lahore</h1>
      <p className="mt-2 max-w-2xl text-ink-600">Clear, practical advice for tenants and landlords renting property in Lahore.</p>
      {categories.map((cat) => (
        <section key={cat} className="mt-10">
          <h2 className="text-xl font-bold">{cat}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {GUIDES.filter((g) => g.category === cat).map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}/`} className="card group flex flex-col p-5 hover:shadow-lift">
                <h3 className="text-lg font-bold group-hover:text-brick-700">{g.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-ink-600">{g.description}</p>
                <p className="mt-3 text-xs text-ink-400">{g.readMinutes} min read</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
