import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, absoluteUrl, SITE_DESCRIPTION, CONTACT_EMAIL } from "./site";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** Page should not be indexed (private, empty or filtered pages). Links are still followed. */
  noindex?: boolean;
  image?: string | null;
  /** Override canonical (e.g. filtered pages canonicalise to the clean path). */
  canonicalPath?: string;
  type?: "website" | "article";
};

/** Unique title/description/canonical/OG/Twitter for a page. */
export function pageMetadata(input: PageMetaInput): Metadata {
  const canonical = absoluteUrl(input.canonicalPath ?? input.path);
  const images = [input.image ? { url: absoluteUrl(input.image) } : { url: absoluteUrl("/og-default.png"), width: 1200, height: 630, alt: SITE_NAME }];
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    robots: input.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: input.type ?? "website",
      siteName: SITE_NAME,
      locale: "en_PK",
      url: canonical,
      title: input.title,
      description: input.description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: images.map((i) => i.url),
    },
  };
}

export const PRIVATE_ROBOTS: Metadata["robots"] = { index: false, follow: false };

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: absoluteUrl("/logo.png"),
    email: CONTACT_EMAIL,
    description: SITE_DESCRIPTION,
    areaServed: { "@type": "City", name: "Lahore", addressCountry: "PK" },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: "en-PK",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/rent/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function itemListJsonLd(items: { name: string; path: string }[], offset = 0) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: offset + i + 1,
      url: absoluteUrl(it.path),
      name: it.name,
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** Serialise JSON-LD safely for inline <script> (prevents </script> breakout). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
