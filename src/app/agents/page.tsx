import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { VerifiedBadge } from "@/components/property/Badges";
import { prisma } from "@/lib/db";
import { activeWhere } from "@/lib/properties";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 600;

export const metadata: Metadata = pageMetadata({
  title: "Rental Agents & Landlords in Lahore | RentNest Lahore",
  description: "Find property agents and landlords with active rental listings in Lahore. View their areas, listings and contact options.",
  path: "/agents/",
});

export default async function AgentsPage() {
  const agents = await prisma.agent.findMany({
    where: { properties: { some: activeWhere() } },
    orderBy: [{ verified: "desc" }, { name: "asc" }],
    select: {
      slug: true, name: true, agency: true, type: true, verified: true, isDemo: true,
      areasServed: { select: { name: true }, take: 4 },
      _count: { select: { properties: { where: activeWhere() } } },
    },
  });
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Agents & landlords", path: "/agents/" }]} />
      <h1 className="mt-4 text-3xl font-extrabold">Agents & landlords in Lahore</h1>
      <p className="mt-2 text-ink-600">Profiles with active rental listings on RentNest Lahore.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <li key={a.slug}>
            <Link href={`/agents/${a.slug}/`} className="card block h-full p-5 hover:shadow-lift">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink-900 font-bold text-white">{a.name.slice(0, 1)}</span>
                <div className="min-w-0">
                  <p className="truncate font-bold">{a.name}</p>
                  <p className="truncate text-sm text-ink-500">{a.agency ?? (a.type === "LANDLORD" ? "Landlord" : "Agent")}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.verified && <VerifiedBadge label="Verified Agent" />}
                {a.isDemo && <span className="badge bg-amber-300 text-amber-950">Demo profile</span>}
              </div>
              <p className="mt-3 text-sm text-ink-600">{a._count.properties} active rental{a._count.properties === 1 ? "" : "s"}{a.areasServed.length ? ` · ${a.areasServed.map((x) => x.name).join(", ")}` : ""}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
