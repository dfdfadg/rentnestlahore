import { listingPageUrls, propertyUrls, staticPageUrls, urlset } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  let urls;
  if (file === "pages.xml") urls = await staticPageUrls();
  else if (file === "listings.xml") urls = await listingPageUrls();
  else {
    const m = /^properties-(\d{1,4})\.xml$/.exec(file);
    if (!m) return new Response("Not found", { status: 404 });
    urls = await propertyUrls(Number(m[1]));
    if (!urls.length && Number(m[1]) > 1) return new Response("Not found", { status: 404 });
  }
  return new Response(urlset(urls), {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
