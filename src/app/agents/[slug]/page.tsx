import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PropertyCard } from "@/components/property/PropertyCard";
import { VerifiedBadge } from "@/components/property/Badges";
import { JsonLd } from "@/components/JsonLd";
import { SmartImage } from "@/components/ui/SmartImage";
import { AgentContact } from "@/components/property/AgentContact";
import { prisma } from "@/lib/db";
import { activeWhere, cardSelect } from "@/lib/properties";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 600;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

const load = cache(async (slug: string) => {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) notFound();
  const agent = await prisma.agent.findUnique({
    where: { slug },
    include: { areasServed: { select: { name: true, slug: true } } },
  });
  if (!agent) notFound();
  const properties = await prisma.property.findMany({
    where: { AND: [activeWhere(), { agentId: agent.id }] },
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
    take: 60,
  });
  return { agent, properties };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { agent, properties } = await load(slug);
  const role = agent.type === "LANDLORD" ? "Landlord" : "Property agent";
  return pageMetadata({
    title: `${agent.name}${agent.agency ? ` – ${agent.agency}` : ""} | Rentals in Lahore | RentNest Lahore`,
    description: `${role} with ${properties.length} active rental listing${properties.length === 1 ? "" : "s"} in Lahore${agent.areasServed.length ? `, serving ${agent.areasServed.slice(0, 4).map((a) => a.name).join(", ")}` : ""}.`,
    path: `/agents/${agent.slug}/`,
    noindex: properties.length === 0 || agent.isDemo,
    image: agent.imageUrl,
  });
}

export default async function AgentPage({ params }: Props) {
  const { slug } = await params;
  const { agent, properties } = await load(slug);
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Agents", path: "/agents/" }, { name: agent.name, path: `/agents/${agent.slug}/` }]} />
      {agent.isDemo && (
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <strong>Demo profile.</strong> This agent profile is sample data for testing and does not represent a real person or agency.
        </p>
      )}
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-ink-900">
              {agent.imageUrl ? <SmartImage src={agent.imageUrl} alt={agent.name} fill sizes="80px" className="object-cover" /> : <span className="grid h-full place-items-center text-2xl font-bold text-white">{agent.name.slice(0, 1)}</span>}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">{agent.name}</h1>
              <p className="text-ink-600">{agent.agency ?? (agent.type === "LANDLORD" ? "Landlord" : "Property agent")}</p>
              {agent.verified && <div className="mt-1.5"><VerifiedBadge label="Verified Agent" /></div>}
            </div>
          </div>
          {agent.about && <p className="mt-6 max-w-3xl whitespace-pre-line text-[15px] leading-7 text-ink-700">{agent.about}</p>}
          {agent.areasServed.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Areas served</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {agent.areasServed.map((a) => (
                  <li key={a.slug}><a href={`/rent/${a.slug}/`} className="badge bg-white px-3 py-1.5 text-sm text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50">{a.name}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <aside className="card h-fit p-5">
          <h2 className="font-bold">Contact {agent.type === "LANDLORD" ? "landlord" : "agent"}</h2>
          <p className="mt-1 text-sm text-ink-500">Mention RentNest Lahore when you get in touch.</p>
          <div className="mt-4"><AgentContact slug={agent.slug} /></div>
        </aside>
      </div>
      <h2 className="mt-12 text-2xl font-extrabold">Active rental listings ({properties.length})</h2>
      {properties.length === 0 ? (
        <p className="mt-4 text-ink-600">No active rental listings right now.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          name: agent.agency ?? agent.name,
          url: absoluteUrl(`/agents/${agent.slug}/`),
          ...(agent.imageUrl ? { image: absoluteUrl(agent.imageUrl) } : {}),
          ...(agent.about ? { description: agent.about.slice(0, 300) } : {}),
          areaServed: agent.areasServed.map((a) => ({ "@type": "Place", name: `${a.name}, Lahore` })),
          address: { "@type": "PostalAddress", addressLocality: "Lahore", addressCountry: "PK" },
        }}
      />
    </div>
  );
}
