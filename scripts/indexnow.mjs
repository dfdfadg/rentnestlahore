/**
 * Submit URLs to IndexNow (Bing, Yandex, Seznam, Naver…) manually.
 *   npm run indexnow -- https://rentnestlahore.pk/guides/some-guide/ [more URLs]
 *   npm run indexnow -- --sitemap        (submit every URL in the live sitemap, e.g. after a big update)
 * Listing changes are submitted automatically by the app; this is for guides/static pages.
 */
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://rentnestlahore.pk").replace(/\/+$/, "");
const KEY = process.env.INDEXNOW_KEY || "bc4f39b465562cd66bef66df2ca7b838";

async function sitemapUrls() {
  const index = await (await fetch(`${SITE}/sitemap.xml`)).text();
  const files = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = [];
  for (const f of files) {
    const xml = await (await fetch(f)).text();
    urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  }
  return urls;
}

const args = process.argv.slice(2);
const urls = args.includes("--sitemap") ? await sitemapUrls() : args.filter((a) => a.startsWith("http"));
if (!urls.length) {
  console.error("Usage: npm run indexnow -- <url> [url…] | --sitemap");
  process.exit(1);
}
const host = new URL(SITE).hostname;
for (let i = 0; i < urls.length; i += 10000) {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls.slice(i, i + 10000) }),
  });
  console.log(`Submitted ${Math.min(urls.length - i, 10000)} URL(s): HTTP ${res.status}`);
}
