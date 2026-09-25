import Link from "next/link";
import { AlertTriangle, Bath, BedDouble, Building, CalendarDays, Check, Hash, Layers, MapPin, Maximize2, Sofa, Wrench } from "lucide-react";
import type { PropertyDetail, PropertyCardData } from "@/lib/properties";
import { Breadcrumbs } from "../ui/Breadcrumbs";
import { Gallery } from "./Gallery";
import { ContactActions, ViewTracker } from "./ContactActions";
import { EnquiryForm } from "./EnquiryForm";
import { ReportForm } from "./ReportForm";
import { ShareButton } from "./ShareButton";
import { FavoriteButton } from "./FavoriteButton";
import { MapEmbed } from "./MapEmbed";
import { VideoEmbed } from "./VideoEmbed";
import { PropertyCard } from "./PropertyCard";
import { DemoBadge, FeaturedBadge, VerifiedBadge } from "./Badges";
import { SmartImage } from "../ui/SmartImage";
import {
  CONDITION_LABEL, FREQUENCY_LABEL, FURNISHED_LABEL, formatArea, formatDate, formatNumber, formatPKR, propertyRef, timeAgo,
} from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import { listingPath } from "@/lib/search-params";
import type { Crumb } from "@/lib/seo";
import type { LandingType } from "@/lib/taxonomy";
import { GUIDES } from "@/content/guides";

type Props = {
  property: PropertyDetail;
  landing: LandingType | null;
  similar: PropertyCardData[];
  unavailableReason?: string | null;
  preview?: boolean;
  relatedLinks: { href: string; label: string }[];
  similarHeading?: string;
};

export function PropertyView({ property: p, landing, similar, unavailableReason, preview, relatedLinks, similarHeading }: Props) {
  const url = absoluteUrl(`/property/${p.slug}/`);
  const typePlural = landing?.slug ?? p.propertyType.pluralSlug;
  const parent = p.location.parent;
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Rent", path: "/rent/" },
    { name: p.propertyType.pluralName, path: listingPath({ type: typePlural }) },
    ...(parent ? [{ name: parent.name, path: listingPath({ area: parent.slug, type: typePlural }) }] : []),
    { name: p.location.name, path: listingPath({ area: p.location.slug, type: typePlural }) },
    { name: p.title, path: `/property/${p.slug}/` },
  ];
  const place = [p.society, p.location.name].filter(Boolean).join(", ");
  const commercial = p.propertyType.category === "COMMERCIAL";
  const available = !unavailableReason && !preview;
  const areaGuide = GUIDES.find((g) => g.related.some((r) => r.href === `/rent/${(parent ?? p.location).slug}/`));

  const facts: { icon: React.ReactNode; label: string; value: string }[] = [
    { icon: <Building className="h-5 w-5" />, label: "Type", value: p.propertyType.name },
    { icon: <Maximize2 className="h-5 w-5" />, label: "Area", value: formatArea(p.area, p.areaUnit) },
    ...(p.bedrooms ? [{ icon: <BedDouble className="h-5 w-5" />, label: "Bedrooms", value: String(p.bedrooms) }] : []),
    ...(p.bathrooms ? [{ icon: <Bath className="h-5 w-5" />, label: "Bathrooms", value: String(p.bathrooms) }] : []),
    ...(p.furnished ? [{ icon: <Sofa className="h-5 w-5" />, label: "Furnishing", value: FURNISHED_LABEL[p.furnished] }] : []),
    ...(p.condition ? [{ icon: <Wrench className="h-5 w-5" />, label: "Condition", value: CONDITION_LABEL[p.condition] }] : []),
  ];

  const details: [string, string][] = [
    ["Property ID", propertyRef(p.refNo)],
    ["Purpose", "For Rent"],
    ["Property type", p.propertyType.name],
    [`Rent (per ${FREQUENCY_LABEL[p.priceFrequency]})`, formatPKR(p.price)],
    ...(p.priceFrequency !== "MONTHLY" ? ([["Monthly equivalent", formatPKR(p.monthlyRent)]] as [string, string][]) : []),
    ...(p.securityDeposit != null ? ([["Security deposit", formatPKR(p.securityDeposit)]] as [string, string][]) : []),
    ...(p.advanceMonths != null ? ([["Advance rent", `${p.advanceMonths} month${p.advanceMonths === 1 ? "" : "s"}`]] as [string, string][]) : []),
    ["Area", `${formatArea(p.area, p.areaUnit)}${p.areaUnit !== "SQFT" ? ` (≈ ${formatNumber(Math.round(p.areaSqft))} sq ft)` : ""}`],
    ["Location", `${place}, Lahore`],
    ...(p.floor != null ? ([["Floor", p.floor === 0 ? "Ground" : p.floor < 0 ? "Basement" : String(p.floor)]] as [string, string][]) : []),
    ...(commercial || p.mainRoad ? ([["Main road", p.mainRoad ? "Yes" : "No"]] as [string, string][]) : []),
    ...(commercial || p.corner ? ([["Corner", p.corner ? "Yes" : "No"]] as [string, string][]) : []),
    ...(p.frontFt ? ([["Front", `${p.frontFt} ft`]] as [string, string][]) : []),
    ...(p.loadingArea ? ([["Loading area", "Yes"]] as [string, string][]) : []),
    ...(p.ceilingHeightFt ? ([["Ceiling height", `${p.ceilingHeightFt} ft`]] as [string, string][]) : []),
    ...(p.publishedAt ? ([["Posted", formatDate(p.publishedAt)]] as [string, string][]) : []),
    ["Updated", formatDate(p.updatedAt)],
  ];

  return (
    <div className="container-page py-6 pb-28 lg:py-8 lg:pb-8">
      {available && <ViewTracker propertyId={p.id} type={p.propertyType.slug} area={p.location.slug} />}
      <Breadcrumbs items={crumbs} />

      {p.isDemo && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-400 px-5 py-4 text-amber-950 shadow-sm">
          <AlertTriangle className="mt-0.5 h-7 w-7 shrink-0" />
          <div>
            <p className="text-lg font-extrabold uppercase tracking-wide">Demo Property</p>
            <p className="mt-0.5 text-sm font-medium">
              This is a sample listing used to show how RentNest Lahore works. It is not a real property and is not available for rent. Photos are stock images and contact numbers are non-working placeholders.
            </p>
          </div>
        </div>
      )}
      {unavailableReason && (
        <div className="mt-4 rounded-2xl bg-ink-900 px-5 py-4 text-white">
          <p className="font-semibold">{unavailableReason}</p>
          <p className="mt-1 text-sm text-ink-300">
            Browse similar{" "}
            <Link href={listingPath({ area: p.location.slug, type: typePlural })} className="underline">{p.propertyType.pluralName.toLowerCase()} for rent in {p.location.name}</Link>.
          </p>
        </div>
      )}
      {preview && (
        <div className="mt-4 rounded-2xl bg-brick-50 px-5 py-3 text-sm text-brick-800 ring-1 ring-brick-200">
          Preview — status: <strong>{p.status.replace("_", " ").toLowerCase()}</strong>. This page is only visible to you.
        </div>
      )}

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <Gallery images={p.images.map((i) => ({ url: i.url, alt: i.alt }))} title={p.title} />

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {p.featured && <FeaturedBadge />}
            {p.verified && <VerifiedBadge label="Verified Property" />}
            {p.isDemo && <DemoBadge />}
            <span className="badge bg-ink-50 text-ink-600 ring-1 ring-ink-100"><Hash className="h-3 w-3" />{propertyRef(p.refNo)}</span>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">{p.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-ink-600">
            <MapPin className="h-4 w-4 text-brick-500" /> {place}, Lahore
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <p>
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">Monthly rent</span>
              <span className="mt-0.5 block text-3xl font-extrabold text-ink-900">
                {formatPKR(p.price)} <span className="text-base font-medium text-ink-500">/ {FREQUENCY_LABEL[p.priceFrequency]}</span>
              </span>
            </p>
            <div className="flex gap-2">
              {available && <FavoriteButton propertyId={p.id} variant="button" />}
              <ShareButton url={url} title={p.title} />
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-3">
                <span className="text-brick-600">{f.icon}</span>
                <div>
                  <dt className="text-xs text-ink-500">{f.label}</dt>
                  <dd className="font-semibold text-ink-900">{f.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <Section title="Description">
            <div className="whitespace-pre-line text-[15px] leading-7 text-ink-700">{p.description}</div>
          </Section>

          {p.features.length > 0 && (
            <Section title="Features">
              <ul className="grid gap-2 sm:grid-cols-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[15px] text-ink-700"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />{f}</li>
                ))}
              </ul>
            </Section>
          )}

          {p.amenities.length > 0 && (
            <Section title="Amenities">
              <ul className="flex flex-wrap gap-2">
                {p.amenities.map((a) => (
                  <li key={a.id} className="badge bg-white px-3 py-1.5 text-sm font-medium text-ink-700 ring-1 ring-ink-100">{a.name}</li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Property details">
            <dl className="grid overflow-hidden rounded-2xl border border-ink-100 bg-white sm:grid-cols-2">
              {details.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-ink-100 px-4 py-3 text-sm">
                  <dt className="text-ink-500">{k}</dt>
                  <dd className="text-right font-medium text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {p.videoUrl && (
            <Section title="Video tour">
              <VideoEmbed url={p.videoUrl} title={p.title} />
            </Section>
          )}

          {(p.latitude ?? p.location.latitude) != null && (
            <Section title="Location">
              <MapEmbed lat={(p.latitude ?? p.location.latitude)!} lng={(p.longitude ?? p.location.longitude)!} label={`${place}, Lahore`} />
            </Section>
          )}

          <Section title={`Explore ${parent?.name ?? p.location.name}`}>
            <ul className="flex flex-wrap gap-2">
              {relatedLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-10 items-center rounded-full border border-ink-200 bg-white px-4 text-sm font-medium text-ink-700 hover:border-ink-400">
                    {l.label}
                  </Link>
                </li>
              ))}
              {areaGuide && (
                <li>
                  <Link href={`/guides/${areaGuide.slug}/`} className="inline-flex min-h-10 items-center rounded-full border border-ink-200 bg-white px-4 text-sm font-medium text-ink-700 hover:border-ink-400">
                    Read the {areaGuide.title}
                  </Link>
                </li>
              )}
            </ul>
          </Section>
        </div>

        {/* Contact sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-ink-900">
                {p.agent.imageUrl ? (
                  <SmartImage src={p.agent.imageUrl} alt={p.agent.name} fill sizes="56px" className="object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-lg font-bold text-white">{p.agent.name.slice(0, 1)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{p.agent.type === "LANDLORD" ? "Landlord" : "Agent"}</p>
                <Link href={`/agents/${p.agent.slug}/`} className="block truncate font-bold text-ink-900 hover:underline">{p.agent.name}</Link>
                {p.agent.agency && <p className="truncate text-sm text-ink-500">{p.agent.agency}</p>}
                {p.agent.verified && <span className="mt-1 inline-block"><VerifiedBadge label="Verified Agent" /></span>}
              </div>
            </div>
            {available ? (
              <div className="mt-5">
                <ContactActions propertyId={p.id} propertyUrl={url} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink-500">Contact options are disabled because this listing is not currently available.</p>
            )}
            {p.publishedAt && (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-500">
                <CalendarDays className="h-3.5 w-3.5" /> Posted {timeAgo(p.publishedAt)} · Updated {formatDate(p.updatedAt)}
              </p>
            )}
          </div>

          {available && (
            <div className="card p-5" id="enquiry">
              <h2 className="text-lg font-bold">Send an enquiry</h2>
              <p className="mb-4 mt-1 text-sm text-ink-500">Ask about availability, viewing times or terms.</p>
              <EnquiryForm propertyId={p.id} title={p.title} />
            </div>
          )}
          {!preview && <ReportForm propertyId={p.id} />}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold">{similarHeading ?? `Similar ${p.propertyType.pluralName.toLowerCase()} for rent`}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => <PropertyCard key={s.id} property={s} />)}
          </div>
        </section>
      )}

      {/* Mobile sticky actions */}
      {available && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-white/95 p-3 backdrop-blur lg:hidden">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-lg font-extrabold">{formatPKR(p.price)}<span className="text-sm font-medium text-ink-500"> / {FREQUENCY_LABEL[p.priceFrequency]}</span></span>
            <span className="flex items-center gap-1 text-xs text-ink-500"><Layers className="h-3.5 w-3.5" />{p.propertyType.name}</span>
          </div>
          <ContactActions propertyId={p.id} propertyUrl={url} layout="bar" />
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
