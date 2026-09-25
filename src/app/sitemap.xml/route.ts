import { absoluteUrl } from "@/lib/site";
import { propertyChunkCount } from "@/lib/sitemap";

export const revalidate = 3600;

/** Sitemap index: static pages, landing pages and chunked property sitemaps (scales past 100k listings). */
export async function GET() {
  const chunks = await propertyChunkCount();
  const files = ["pages.xml", "listings.xml", ...Array.from({ length: chunks }, (_, i) => `properties-${i + 1}.xml`)];
  const now = new Date().toISOString();
  const body = files.map((f) => `<sitemap><loc>${absoluteUrl(`/sitemaps/${f}`)}</loc><lastmod>${now}</lastmod></sitemap>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
