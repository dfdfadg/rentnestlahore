import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Home, MapPin, MessageCircle, Search, ShieldCheck, Store, Warehouse } from "lucide-react";
import { HeroSearch } from "@/components/search/HeroSearch";
import { PropertyGrid } from "@/components/property/PropertyCard";
import { JsonLd } from "@/components/JsonLd";
import { getFilterOptions } from "@/lib/listing-page";
import { countByLocationRollup, countByType, getFeaturedProperties, getLatestProperties } from "@/lib/properties";
import { getLandingTypes, getLocations } from "@/lib/taxonomy";
import { GUIDES } from "@/content/guides";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { formatNumber } from "@/lib/format";
import { SITE_DESCRIPTION } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Properties for Rent in Lahore — Houses, Flats, Offices & Shops | RentNest Lahore",
  description: SITE_DESCRIPTION,
  path: "/",
});

const FAQS = [
  {
    q: "Is RentNest Lahore only for rental properties?",
    a: "Yes. RentNest Lahore is a rent-only marketplace. Every listing is a property available for rent in Lahore — houses, flats, apartments, portions, rooms, offices, shops, warehouses and other commercial space. We do not list properties for sale.",
  },
  {
    q: "How do I contact a landlord or agent?",
    a: "Open any listing and use the Call or WhatsApp buttons, or send an enquiry through the contact form. Your enquiry goes directly to the landlord or agent who posted the property.",
  },
  {
    q: "What does the Verified badge mean?",
    a: "A Verified badge is shown only when our team has checked the listing or agent details. Listings without the badge have not been verified yet, so always visit the property and check documents before paying anything.",
  },
  {
    q: "How can I list my property for rent?",
    a: "Create a free account, choose Post Property and add the details and photos. Every new listing is reviewed by our team before it goes live to keep the marketplace free of spam and duplicates.",
  },
  {
    q: "What costs should I expect when renting in Lahore?",
    a: "Besides monthly rent, most landlords ask for a refundable security deposit and some advance rent, and tenants usually pay utilities. Agree all amounts in a written tenancy agreement. Our rental guides explain each step.",
  },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  houses: <Home className="h-6 w-6" />,
  flats: <Building2 className="h-6 w-6" />,
  apartments: <Building2 className="h-6 w-6" />,
  portions: <Home className="h-6 w-6" />,
  rooms: <Home className="h-6 w-6" />,
  offices: <Building2 className="h-6 w-6" />,
  shops: <Store className="h-6 w-6" />,
  warehouses: <Warehouse className="h-6 w-6" />,
};

export default async function HomePage() {
  const [options, featured, latest, typeCounts, locCounts, landing, locations] = await Promise.all([
    getFilterOptions(),
    getFeaturedProperties(8),
    getLatestProperties(8),
    countByType(),
    countByLocationRollup(),
    getLandingTypes(),
    getLocations(),
  ]);
  const byTypeSlug = (slugs: string[]) => landing.filter((l) => slugs.includes(l.slug));
  const typeIdsFor = (slug: string) => landing.find((l) => l.slug === slug)?.typeIds ?? [];
  const [houses, flats, commercial] = await Promise.all([
    getLatestProperties(4, { propertyTypeId: { in: typeIdsFor("houses") } }),
    getLatestProperties(4, { propertyTypeId: { in: [...typeIdsFor("flats"), ...typeIdsFor("apartments")] } }),
    getLatestProperties(4, { propertyTypeId: { in: typeIdsFor("commercial-properties") } }),
  ]);
  const totalActive = [...typeCounts.values()].reduce((a, b) => a + b, 0);
  const categories = byTypeSlug(["houses", "flats", "apartments", "portions", "rooms", "offices", "shops", "warehouses"]).map((l) => ({
    ...l,
    count: l.typeIds.reduce((s, id) => s + (typeCounts.get(id) ?? 0), 0),
  }));
  const popularAreas = locations
    .filter((l) => !l.parentId && l.isPopular)
    .map((l) => ({ ...l, count: locCounts.get(l.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900">
        <div
          className="absolute inset-0 opacity-[0.07]"
          aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }}
        />
        <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-brick-600/25 blur-3xl" aria-hidden="true" />
        <div className="container-page relative pb-14 pt-12 sm:pb-20 sm:pt-16">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brick-200 ring-1 ring-white/15">
            <MapPin className="h-3.5 w-3.5" /> Lahore rentals only
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            Find Your Place to Rent in <span className="text-brick-400">Lahore</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-200">
            Search houses, flats, offices, shops and other rental properties across Lahore.
          </p>
          <div className="mt-8">
            <HeroSearch types={options.types} locations={options.locations} />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-ink-300">
            <span>Popular:</span>
            {[
              { href: "/rent/dha-lahore/houses/", label: "Houses in DHA" },
              { href: "/rent/johar-town/", label: "Johar Town" },
              { href: "/rent/gulberg/offices/", label: "Offices in Gulberg" },
              { href: "/rent/portions/", label: "Portions" },
              { href: "/rent/bahria-town/", label: "Bahria Town" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="rounded-full bg-white/10 px-3 py-1 text-white ring-1 ring-white/15 hover:bg-white/20">
                {l.label}
              </Link>
            ))}
          </div>
          <p className="mt-8 text-sm text-ink-300">
            <strong className="text-white">{formatNumber(totalActive)}</strong> active rental listings across{" "}
            <strong className="text-white">{formatNumber([...locCounts.entries()].filter(([id, c]) => c > 0 && !locations.find((l) => l.id === id)?.parentId).length)}</strong> Lahore areas
          </p>
        </div>
      </section>

      {featured.length > 0 && (
        <Section title="Featured rental properties" subtitle="Hand-picked rentals from landlords and agents across Lahore" href="/rent/" linkLabel="View all rentals">
          <PropertyGrid properties={featured} priorityCount={0} />
        </Section>
      )}

      <Section title="Latest rental properties" subtitle="Newly listed homes and commercial space for rent" href="/rent/" linkLabel="See all new rentals">
        <PropertyGrid properties={latest} />
      </Section>

      <Section title="Popular rental categories" subtitle="Browse rentals by property type">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.slug} href={`/rent/${c.slug}/`} className="card group flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brick-50 text-brick-600 group-hover:bg-brick-600 group-hover:text-white">
                {TYPE_ICONS[c.slug] ?? <Home className="h-6 w-6" />}
              </span>
              <span>
                <span className="block font-semibold text-ink-900">{c.pluralName}</span>
                <span className="text-sm text-ink-500">{formatNumber(c.count)} for rent</span>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Popular Lahore areas" subtitle="Explore rentals in the city's most in-demand neighbourhoods" href="/areas/" linkLabel="All areas">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {popularAreas.map((a, i) => (
            <Link
              key={a.slug}
              href={`/rent/${a.slug}/`}
              className={`group relative flex min-h-28 flex-col justify-end overflow-hidden rounded-2xl p-4 text-white ${
                ["bg-ink-800", "bg-brick-700", "bg-ink-700", "bg-ink-900"][i % 4]
              }`}
            >
              <MapPin className="absolute right-4 top-4 h-5 w-5 opacity-50" />
              <span className="font-display text-lg font-bold">{a.name}</span>
              <span className="text-sm text-white/75">{formatNumber(a.count)} rentals</span>
            </Link>
          ))}
        </div>
      </Section>

      {houses.length > 0 && (
        <Section title="Houses for rent in Lahore" subtitle="From 5 Marla family homes to 2 Kanal bungalows" href="/rent/houses/" linkLabel="All houses">
          <PropertyGrid properties={houses} />
        </Section>
      )}
      {flats.length > 0 && (
        <Section title="Flats & apartments for rent" subtitle="Compact city living, furnished and unfurnished" href="/rent/flats/" linkLabel="All flats">
          <PropertyGrid properties={flats} />
        </Section>
      )}
      {commercial.length > 0 && (
        <Section title="Commercial rentals" subtitle="Offices, shops, showrooms and warehouses for your business" href="/rent/commercial-properties/" linkLabel="All commercial">
          <PropertyGrid properties={commercial} />
        </Section>
      )}

      {/* Why */}
      <section className="mt-20 bg-white py-16">
        <div className="container-page">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Why RentNest Lahore</h2>
          <p className="mt-2 max-w-2xl text-ink-600">One focus — rentals in Lahore — so every search, filter and page is built around finding a place to rent.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Search className="h-6 w-6" />, title: "Rent-only search", text: "No sale listings to wade through. Filter by monthly rent, size, bedrooms, furnishing and amenities." },
              { icon: <MapPin className="h-6 w-6" />, title: "Lahore expertise", text: "Areas, phases and blocks organised the way Lahore renters actually search — with live rent snapshots." },
              { icon: <ShieldCheck className="h-6 w-6" />, title: "Moderated listings", text: "Every new listing is reviewed before it goes live, and anyone can report a problem listing." },
              { icon: <MessageCircle className="h-6 w-6" />, title: "Contact directly", text: "Call, WhatsApp or send an enquiry to the landlord or agent straight from the listing." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-ink-100 bg-sand-50 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-900 text-brick-400">{f.icon}</span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-600">{f.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl bg-ink-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-8 w-8 text-brick-400" />
              <div>
                <p className="font-bold">Have a property to rent out in Lahore?</p>
                <p className="text-sm text-ink-300">List it free — our team reviews every listing before it goes live.</p>
              </div>
            </div>
            <Link href="/add-property/" className="btn-primary">List your property</Link>
          </div>
        </div>
      </section>

      <Section title="Rental guides" subtitle="Practical advice for renting in Lahore" href="/guides/" linkLabel="All guides">
        <div className="grid gap-5 md:grid-cols-3">
          {GUIDES.slice(0, 3).map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}/`} className="card group flex flex-col p-6 transition hover:shadow-lift">
              <span className="text-xs font-semibold uppercase tracking-wide text-brick-600">{g.category}</span>
              <h3 className="mt-2 text-lg font-bold group-hover:text-brick-700">{g.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-ink-600">{g.description}</p>
              <span className="mt-4 text-sm font-semibold text-ink-800">Read guide →</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Frequently asked questions">
        <div className="max-w-3xl divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
          {FAQS.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900">
                {f.q}
                <span className="text-xl text-brick-600 transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-7 text-ink-600">{f.a}</p>
            </details>
          ))}
        </div>
        <JsonLd data={faqJsonLd(FAQS)} />
      </Section>

      <section className="container-page mt-16">
        <h2 className="text-lg font-bold">Properties for rent in Lahore</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-ink-600">
          Browse <Link href="/rent/houses/" className="text-brick-700 hover:underline">houses for rent in Lahore</Link>,{" "}
          <Link href="/rent/flats/" className="text-brick-700 hover:underline">flats</Link> and{" "}
          <Link href="/rent/apartments/" className="text-brick-700 hover:underline">apartments</Link> for families and professionals, or find{" "}
          <Link href="/rent/offices/" className="text-brick-700 hover:underline">offices</Link>,{" "}
          <Link href="/rent/shops/" className="text-brick-700 hover:underline">shops</Link> and{" "}
          <Link href="/rent/warehouses/" className="text-brick-700 hover:underline">warehouses</Link> for your business. Every listing on RentNest Lahore is a rental — with the monthly rent, size and location up front.
        </p>
      </section>
    </>
  );
}

function Section({ title, subtitle, href, linkLabel, children }: { title: string; subtitle?: string; href?: string; linkLabel?: string; children: React.ReactNode }) {
  return (
    <section className="container-page mt-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold sm:text-[28px]">{title}</h2>
          {subtitle && <p className="mt-1 text-ink-600">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brick-700 hover:underline sm:flex">
            {linkLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
      {href && (
        <Link href={href} className="mt-4 flex items-center gap-1 text-sm font-semibold text-brick-700 sm:hidden">
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </section>
  );
}
