import "server-only";
import { after } from "next/server";
import { absoluteUrl, SITE_URL } from "./site";

/**
 * IndexNow (https://www.indexnow.org) — notifies Bing, Yandex, Seznam, Naver etc. when URLs
 * are added, changed or removed. (Google does not support IndexNow; it discovers changes
 * through the sitemap, which updates automatically.)
 *
 * The key is public by design and is served at /<key>.txt (file in /public).
 */
export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "bc4f39b465562cd66bef66df2ca7b838";

function enabled(): boolean {
  if (process.env.INDEXNOW_ENABLED === "0") return false;
  if (process.env.INDEXNOW_ENABLED === "1") return true;
  // Only the live production site pings — never previews or local development.
  return process.env.VERCEL_ENV === "production" && new URL(SITE_URL).hostname === "rentnestlahore.pk";
}

export async function submitToIndexNow(urls: string[]): Promise<void> {
  const list = [...new Set(urls)].slice(0, 10_000);
  if (!list.length || !enabled()) return;
  const host = new URL(SITE_URL).hostname;
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: absoluteUrl(`/${INDEXNOW_KEY}.txt`), urlList: list }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok && res.status !== 202) console.warn("[indexnow] submit failed", res.status);
  } catch (e) {
    console.warn("[indexnow] submit error", (e as Error).message);
  }
}

/** Ping search engines about changed listings after the response is sent (never blocks users). */
export function notifyListingChange(slugs: string | string[] | undefined) {
  const urls = [slugs ?? []].flat().map((s) => absoluteUrl(`/property/${s}/`));
  if (!urls.length) return;
  urls.push(absoluteUrl("/rent/"));
  after(() => submitToIndexNow(urls));
}
