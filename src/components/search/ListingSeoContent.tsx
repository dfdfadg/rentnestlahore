import Link from "next/link";
import { MapPin } from "lucide-react";
import type { ListingContext } from "@/lib/listing-page";
import { listingHeadings } from "@/lib/listing-page";
import { listingPath } from "@/lib/search-params";
import { countByLocationRollup } from "@/lib/properties";
import { rentStatsByType } from "@/lib/stats";
import { descendantIds, getLandingTypes, getLocations, locationLabel, nearbyLocations } from "@/lib/taxonomy";
import { formatNumber, formatPKR } from "@/lib/format";
import { prisma } from "@/lib/db";
import { activeWhere } from "@/lib/properties";

const MIN_LINKABLE_COMBO = 3;

/** Useful, data-driven supporting content for listing pages (server-rendered for crawlers). */
export async function ListingSeoContent({ ctx }: { ctx: ListingContext }) {
  const [locations, landingTypes] = await Promise.all([getLocations(), getLandingTypes()]);
  const locIds = ctx.location ? descendantIds(ctx.location.id, locations) : undefined;
  const stats = await rentStatsByType(locIds, ctx.landing?.typeIds);
  const { typeName } = listingHeadings(ctx);
  const roots = locations.filter((l) => !l.parentId);

  // Per-area counts for the current type (used for "popular areas" links)
  let areaCounts: { slug: string; name: string; count: number }[] = [];
  if (!ctx.location) {
    if (ctx.landing) {
      const rows = await prisma.property.groupBy({
        by: ["locationId"],
        where: { AND: [activeWhere(), { propertyTypeId: { in: ctx.landing.typeIds } }] },
        _count: { _all: true },
      });
      const direct = new Map(rows.map((r) => [r.locationId, r._count._all]));
      areaCounts = roots
        .map((r) => ({ slug: r.slug, name: r.name, count: descendantIds(r.id, locations).reduce((s, id) => s + (direct.get(id) ?? 0), 0) }))
        .filter((a) => a.count > 0)
        .sort((a, b) => b.count - a.count);
    } else {
      const rollup = await countByLocationRollup();
      areaCounts = roots
        .map((r) => ({ slug: r.slug, name: r.name, count: rollup.get(r.id) ?? 0 }))
        .filter((a) => a.count > 0)
        .sort((a, b) => b.count - a.count);
    }
  }

  const children = ctx.location ? locations.filter((l) => l.parentId === ctx.location!.id) : [];
  const nearby = ctx.location ? nearbyLocations(ctx.parentLocation ?? ctx.location, locations, 6) : [];
  const description = ctx.location?.description ?? ctx.parentLocation?.description ?? null;
  const typeDescription = ctx.landing?.description ?? null;

  return (
    <div className="mt-16 grid gap-10 border-t border-ink-100 pt-10 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-10">
        {ctx.location && description && (
          <section>
            <h2 className="text-xl font-bold">About renting in {ctx.location.name}</h2>
            <p className="mt-3 text-[15px] leading-7 text-ink-700">{description}</p>
          </section>
        )}
        {ctx.landing && typeDescription && (
          <section>
            <h2 className="text-xl font-bold">{ctx.location ? `${typeName} in ${ctx.location.name}` : `Renting ${typeName.toLowerCase()} in Lahore`}</h2>
            <p className="mt-3 text-[15px] leading-7 text-ink-700">{typeDescription}</p>
          </section>
        )}
        {!ctx.landing && !ctx.location && (
          <section>
            <h2 className="text-xl font-bold">Renting property in Lahore</h2>
            <p className="mt-3 text-[15px] leading-7 text-ink-700">
              RentNest Lahore lists only rental properties, only in Lahore. Families usually start with houses and portions in areas like
              DHA, Johar Town, Bahria Town and Model Town, while students and young professionals often look at flats and rooms near
              universities and offices. Businesses can compare offices in Gulberg and DHA, shops on busy boulevards, and warehouses along
              Raiwind Road. Always confirm the monthly rent, security deposit, advance and utility arrangements before you sign.
            </p>
          </section>
        )}

        {stats.length > 0 && (
          <section>
            <h2 className="text-xl font-bold">Monthly rent snapshot{ctx.location ? ` — ${ctx.location.name}` : " — Lahore"}</h2>
            <p className="mt-2 text-sm text-ink-500">Calculated from active listings on RentNest Lahore today. Asking rents only.</p>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Property type</th>
                    <th className="px-4 py-3 font-semibold">Listings</th>
                    <th className="px-4 py-3 font-semibold">Typical rent (median)</th>
                    <th className="px-4 py-3 font-semibold">Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {stats.map((s) => {
                    const href = ctx.location
                      ? s.count >= MIN_LINKABLE_COMBO ? listingPath({ area: ctx.location.slug, type: s.pluralSlug }) : null
                      : listingPath({ type: s.pluralSlug });
                    return (
                      <tr key={s.typeId}>
                        <td className="px-4 py-3 font-medium text-ink-800">
                          {href ? <Link href={href} className="hover:text-brick-700 hover:underline">{s.pluralName}</Link> : s.pluralName}
                        </td>
                        <td className="px-4 py-3">{formatNumber(s.count)}</td>
                        <td className="px-4 py-3 font-semibold">{formatPKR(s.median)}</td>
                        <td className="px-4 py-3 text-ink-500">{s.count > 1 ? `${formatPKR(s.min)} – ${formatPKR(s.max)}` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {areaCounts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold">{ctx.landing ? `Popular areas for ${typeName.toLowerCase()}` : "Rentals by Lahore area"}</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {areaCounts.slice(0, 18).map((a) => {
                const linkable = !ctx.landing || a.count >= MIN_LINKABLE_COMBO;
                const href = linkable ? listingPath({ area: a.slug, type: ctx.landing?.slug }) : listingPath({ area: a.slug });
                return (
                  <li key={a.slug}>
                    <Link href={href} className="flex items-center justify-between rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm hover:border-ink-300">
                      <span className="flex items-center gap-2 font-medium text-ink-800"><MapPin className="h-4 w-4 text-brick-500" />{a.name}</span>
                      <span className="text-ink-500">{formatNumber(a.count)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      <aside className="min-w-0 space-y-8">
        {children.length > 0 && (
          <LinkList
            title={`Areas within ${ctx.location!.name}`}
            links={children.map((c) => ({ href: listingPath({ area: c.slug, type: ctx.landing?.slug }), label: c.name }))}
          />
        )}
        {nearby.length > 0 && (
          <LinkList
            title={`Rentals near ${ctx.location!.name}`}
            links={nearby.map((n) => ({ href: listingPath({ area: n.slug }), label: `Rentals in ${locationLabel(n)}` }))}
          />
        )}
        {ctx.location && (
          <LinkList
            title={`More in ${ctx.location.name}`}
            links={[
              ...(ctx.landing ? [{ href: listingPath({ area: ctx.location.slug }), label: `All rentals in ${ctx.location.name}` }] : []),
              ...(ctx.landing ? [{ href: listingPath({ type: ctx.landing.slug }), label: `${typeName} for rent across Lahore` }] : []),
              { href: "/guides/", label: "Lahore rental guides" },
            ]}
          />
        )}
        {!ctx.location && (
          <LinkList
            title="Browse by property type"
            links={landingTypes
              .filter((t) => t.slug !== ctx.landing?.slug)
              .slice(0, 14)
              .map((t) => ({ href: listingPath({ type: t.slug }), label: `${t.pluralName} for rent` }))}
          />
        )}
      </aside>
    </div>
  );
}

function LinkList({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <section>
      <h2 className="text-base font-bold">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-ink-600 hover:text-brick-700 hover:underline">{l.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
