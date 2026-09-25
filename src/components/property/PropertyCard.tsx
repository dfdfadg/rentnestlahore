import Link from "next/link";
import { Bath, BedDouble, MapPin, Maximize2 } from "lucide-react";
import type { PropertyCardData } from "@/lib/properties";
import { formatArea, formatPKR, FREQUENCY_LABEL, FURNISHED_LABEL, formatPKRCompact, timeAgo } from "@/lib/format";
import { SmartImage } from "../ui/SmartImage";
import { FavoriteButton } from "./FavoriteButton";
import { DemoBadge, FeaturedBadge, VerifiedBadge } from "./Badges";

type Props = {
  property: PropertyCardData;
  priority?: boolean;
  layout?: "grid" | "list";
};

export function PropertyCard({ property: p, priority = false, layout = "grid" }: Props) {
  const img = p.images[0];
  const href = `/property/${p.slug}/`;
  const place = [p.society, p.location.name].filter(Boolean).join(", ");
  const list = layout === "list";

  return (
    <article
      className={`group relative flex overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition hover:shadow-lift ${
        list ? "flex-col sm:flex-row" : "flex-col"
      }`}
    >
      <div className={`relative shrink-0 overflow-hidden bg-ink-100 ${list ? "aspect-[4/3] sm:aspect-auto sm:w-72" : "aspect-[4/3]"}`}>
        {img ? (
          <SmartImage
            src={img.url}
            alt={img.alt || p.title}
            fill
            sizes={list ? "(min-width: 640px) 288px, 100vw" : "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            priority={priority}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-ink-400">No photo yet</div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {p.featured && <FeaturedBadge />}
          {p.verified && <VerifiedBadge />}
          {p.isDemo && <DemoBadge />}
        </div>
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton propertyId={p.id} />
        </div>
        {p.isDemo && (
          <p className="absolute inset-x-0 bottom-0 bg-amber-400/95 py-1.5 text-center text-sm font-extrabold uppercase tracking-[0.2em] text-amber-950">
            Demo Property
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-baseline gap-1.5">
          <span className="text-xl font-extrabold text-ink-900">{formatPKR(p.price)}</span>
          <span className="text-sm text-ink-500">/ {FREQUENCY_LABEL[p.priceFrequency]}</span>
        </p>
        <p className="sr-only">Monthly rent approximately PKR {formatPKRCompact(p.monthlyRent)}</p>
        <h3 className="mt-1.5 line-clamp-2 font-sans text-[15px] font-semibold leading-snug text-ink-800">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
            {p.title}
          </Link>
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-sm text-ink-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{place}, Lahore</span>
        </p>
        {p.isDemo && (
          <p className="mt-2 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-bold text-amber-900">
            Demo property — sample only, not available for rent
          </p>
        )}

        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-700">
          {p.bedrooms != null && p.bedrooms > 0 && (
            <li className="flex items-center gap-1.5" title="Bedrooms">
              <BedDouble className="h-4 w-4 text-ink-400" />
              {p.bedrooms} <span className="sr-only sm:not-sr-only">{p.bedrooms === 1 ? "Bed" : "Beds"}</span>
            </li>
          )}
          {p.bathrooms != null && p.bathrooms > 0 && (
            <li className="flex items-center gap-1.5" title="Bathrooms">
              <Bath className="h-4 w-4 text-ink-400" />
              {p.bathrooms} <span className="sr-only sm:not-sr-only">{p.bathrooms === 1 ? "Bath" : "Baths"}</span>
            </li>
          )}
          <li className="flex items-center gap-1.5" title="Area">
            <Maximize2 className="h-4 w-4 text-ink-400" />
            {formatArea(p.area, p.areaUnit)}
          </li>
        </ul>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="badge bg-ink-50 text-ink-700 ring-1 ring-ink-100">{p.propertyType.name}</span>
          {p.furnished && <span className="badge bg-sand-100 text-ink-700 ring-1 ring-sand-200">{FURNISHED_LABEL[p.furnished]}</span>}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-100 pt-3 text-xs text-ink-500">
          {p.publishedAt ? (
            <time dateTime={new Date(p.publishedAt).toISOString()}>Posted {timeAgo(p.publishedAt)}</time>
          ) : (
            <span />
          )}
          <span className="relative z-10 font-semibold text-brick-700 group-hover:underline" aria-hidden="true">
            View Details →
          </span>
        </div>
      </div>
    </article>
  );
}

export function PropertyGrid({ properties, priorityCount = 0 }: { properties: PropertyCardData[]; priorityCount?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((p, i) => (
        <PropertyCard key={p.id} property={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
