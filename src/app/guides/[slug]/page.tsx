import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { GuideBody } from "@/components/guides/GuideBody";
import { JsonLd } from "@/components/JsonLd";
import { GUIDES, getGuide } from "@/content/guides";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { Inline, plainText } from "@/components/ui/Inline";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site";
import { formatDate } from "@/lib/format";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  return pageMetadata({ title: g.seoTitle ?? `${g.title} | RentNest Lahore`, description: g.description, path: `/guides/${g.slug}/`, type: "article" });
}

export default async function GuidePage({ params }: Props) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  // Same-category guides first, then the rest
  const others = GUIDES.filter((x) => x.slug !== g.slug);
  const more = [...others.filter((x) => x.category === g.category), ...others.filter((x) => x.category !== g.category)].slice(0, 5);
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Guides", path: "/guides/" }, { name: g.title, path: `/guides/${g.slug}/` }]} />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brick-600">{g.category}</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">{g.title}</h1>
          <p className="mt-3 text-lg text-ink-600">{g.description}</p>
          <p className="mt-3 text-sm text-ink-400">Updated {formatDate(g.updated)} · {g.readMinutes} min read · By the RentNest Lahore team</p>
          <div className="mt-8"><GuideBody blocks={g.body} /></div>
          {g.faqs && g.faqs.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold">Frequently asked questions</h2>
              <div className="mt-4 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
                {g.faqs.map((f) => (
                  <details key={f.q} className="group p-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900">
                      {f.q}
                      <span className="text-xl text-brick-600 transition group-open:rotate-45" aria-hidden="true">+</span>
                    </summary>
                    <p className="mt-3 text-[15px] leading-7 text-ink-600"><Inline text={f.a} /></p>
                  </details>
                ))}
              </div>
              <JsonLd data={faqJsonLd(g.faqs.map((f) => ({ q: f.q, a: plainText(f.a) })))} />
            </section>
          )}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5">
            <h2 className="font-bold">Browse rentals</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {g.related.map((r) => <li key={r.href}><Link href={r.href} className="text-brick-700 hover:underline">{r.label}</Link></li>)}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="font-bold">More guides</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {more.map((m) => <li key={m.slug}><Link href={`/guides/${m.slug}/`} className="text-ink-700 hover:text-brick-700 hover:underline">{m.title}</Link></li>)}
            </ul>
          </div>
        </aside>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.title,
          description: g.description,
          dateModified: g.updated,
          datePublished: g.updated,
          mainEntityOfPage: absoluteUrl(`/guides/${g.slug}/`),
          author: { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/` },
          publisher: { "@id": `${SITE_URL}/#organization` },
        }}
      />
    </div>
  );
}
