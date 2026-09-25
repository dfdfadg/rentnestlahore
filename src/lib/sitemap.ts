import "server-only";
import { prisma } from "./db";
import { absoluteUrl } from "./site";
import { activeWhere } from "./properties";
import { descendantIds, getLandingTypes, getLocations } from "./taxonomy";
import { listingPath } from "./search-params";
import { GUIDES } from "@/content/guides";

export const PROPERTIES_PER_SITEMAP = 40_000;
const MIN_COMBO = 3;

export type SitemapUrl = { loc: string; lastmod?: Date | string; changefreq?: string; priority?: number };

export function urlset(urls: SitemapUrl[]): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = urls
    .map((u) => {
      const lastmod = u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : "";
      const cf = u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : "";
      const pr = u.priority != null ? `<priority>${u.priority.toFixed(1)}</priority>` : "";
      return `<url><loc>${esc(u.loc)}</loc>${lastmod}${cf}${pr}</url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

/** Only real (non-demo), published, unexpired rentals are listed. */
export function sitemapPropertyWhere() {
  return { AND: [activeWhere(), { isDemo: false }] };
}

export async function staticPageUrls(): Promise<SitemapUrl[]> {
  const pages: SitemapUrl[] = [
    { loc: absoluteUrl("/"), changefreq: "daily", priority: 1 },
    { loc: absoluteUrl("/rent/"), changefreq: "daily", priority: 0.9 },
    { loc: absoluteUrl("/areas/"), changefreq: "weekly", priority: 0.7 },
    { loc: absoluteUrl("/agents/"), changefreq: "weekly", priority: 0.4 },
    { loc: absoluteUrl("/guides/"), changefreq: "weekly", priority: 0.6 },
    { loc: absoluteUrl("/add-property/"), changefreq: "monthly", priority: 0.5 },
    { loc: absoluteUrl("/about/"), changefreq: "yearly", priority: 0.3 },
    { loc: absoluteUrl("/contact/"), changefreq: "yearly", priority: 0.3 },
    { loc: absoluteUrl("/privacy/"), changefreq: "yearly", priority: 0.1 },
    { loc: absoluteUrl("/terms/"), changefreq: "yearly", priority: 0.1 },
  ];
  for (const g of GUIDES) pages.push({ loc: absoluteUrl(`/guides/${g.slug}/`), lastmod: g.updated, changefreq: "monthly", priority: 0.6 });
  // Agent profiles with real active listings
  const agents = await prisma.agent.findMany({
    where: { isDemo: false, properties: { some: sitemapPropertyWhere() } },
    select: { slug: true, updatedAt: true },
  });
  for (const a of agents) pages.push({ loc: absoluteUrl(`/agents/${a.slug}/`), lastmod: a.updatedAt, changefreq: "weekly", priority: 0.4 });
  return pages;
}

/**
 * Category/location landing pages — only those with real inventory (no thin or empty pages).
 * Mirrors the indexability rules used by the listing pages.
 */
export async function listingPageUrls(): Promise<SitemapUrl[]> {
  const [landing, locations, rows] = await Promise.all([
    getLandingTypes(),
    getLocations(),
    prisma.property.groupBy({ by: ["propertyTypeId", "locationId"], where: activeWhere(), _count: { _all: true } }),
  ]);
  const count = (typeIds?: string[], locIds?: string[]) =>
    rows.filter((r) => (!typeIds || typeIds.includes(r.propertyTypeId)) && (!locIds || locIds.includes(r.locationId))).reduce((s, r) => s + r._count._all, 0);
  const urls: SitemapUrl[] = [];
  for (const t of landing) if (count(t.typeIds) > 0) urls.push({ loc: absoluteUrl(listingPath({ type: t.slug })), changefreq: "daily", priority: 0.8 });
  for (const l of locations) {
    const ids = descendantIds(l.id, locations);
    if (count(undefined, ids) === 0) continue;
    urls.push({ loc: absoluteUrl(listingPath({ area: l.slug })), changefreq: "daily", priority: l.parentId ? 0.6 : 0.7 });
    for (const t of landing) {
      if (count(t.typeIds, ids) >= MIN_COMBO) urls.push({ loc: absoluteUrl(listingPath({ area: l.slug, type: t.slug })), changefreq: "daily", priority: 0.6 });
    }
  }
  return urls;
}

export async function propertyUrls(chunk: number): Promise<SitemapUrl[]> {
  const items = await prisma.property.findMany({
    where: sitemapPropertyWhere(),
    select: { slug: true, updatedAt: true },
    orderBy: { id: "asc" },
    skip: (chunk - 1) * PROPERTIES_PER_SITEMAP,
    take: PROPERTIES_PER_SITEMAP,
  });
  return items.map((p) => ({ loc: absoluteUrl(`/property/${p.slug}/`), lastmod: p.updatedAt, changefreq: "weekly", priority: 0.7 }));
}

export async function propertyChunkCount(): Promise<number> {
  const n = await prisma.property.count({ where: sitemapPropertyWhere() });
  return Math.max(1, Math.ceil(n / PROPERTIES_PER_SITEMAP));
}
