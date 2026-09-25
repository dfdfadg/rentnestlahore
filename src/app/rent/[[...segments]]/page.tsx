import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Pagination } from "@/components/ui/Pagination";
import { PropertyCard } from "@/components/property/PropertyCard";
import { FilterForm } from "@/components/search/FilterForm";
import { SortSelect } from "@/components/search/SortSelect";
import { EmptyResults } from "@/components/search/EmptyState";
import { JsonLd } from "@/components/JsonLd";
import { ListingSeoContent } from "@/components/search/ListingSeoContent";
import { hasRefinements, listingHref, listingPath, parseSearchParams, type SearchFilters } from "@/lib/search-params";
import { getFilterOptions, listingHeadings, resolveListingSegments, type ListingContext } from "@/lib/listing-page";
import { searchProperties } from "@/lib/properties";
import { itemListJsonLd, pageMetadata, type Crumb } from "@/lib/seo";
import { formatNumber } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/site";

type Props = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Location + type pages need real inventory before they are indexable. */
const MIN_INDEXABLE_COMBO = 3;

async function load(props: Props) {
  const [{ segments }, sp] = await Promise.all([props.params, props.searchParams]);
  const ctx = await resolveListingSegments(segments);
  const query = parseSearchParams(sp);
  // ?type= / ?area= are folded into the clean path version of the URL.
  if (query.type || query.area) {
    const merged: SearchFilters = { ...query, type: query.type ?? ctx.landing?.slug, area: query.area ?? ctx.location?.slug };
    permanentRedirect(listingHref(merged));
  }
  const filters: SearchFilters = { ...query, type: ctx.landing?.slug, area: ctx.location?.slug };
  const result = await searchProperties(filters, ctx.page, PAGE_SIZE);
  if (!result) notFound();
  if (ctx.page > 1 && ctx.page > result.totalPages) notFound();
  return { ctx, filters, result };
}

/** "1 shop" / "5 shops" / "12 rental properties" */
function countNoun(ctx: ListingContext, n: number): string {
  const plural = (ctx.landing?.pluralName ?? "rental properties").toLowerCase();
  const singular = (ctx.landing?.singularName ?? "rental property").toLowerCase();
  return n === 1 ? singular : plural;
}

function indexable(ctx: ListingContext, filters: SearchFilters, total: number): boolean {
  if (hasRefinements(filters)) return false;
  if (total === 0) return false;
  if (ctx.landing && ctx.location && total < MIN_INDEXABLE_COMBO) return false;
  return true;
}

function description(ctx: ListingContext, total: number): string {
  const { locName } = listingHeadings(ctx);
  const n = total > 0 ? `${formatNumber(total)} ` : "";
  const noun = countNoun(ctx, total);
  if (!ctx.landing && !ctx.location) {
    return `Browse ${n}${noun} across Lahore — houses, flats, portions, offices, shops and warehouses. Filter by area, monthly rent, bedrooms and size.`;
  }
  if (ctx.landing && !ctx.location) {
    return `Find ${n}${noun} for rent in Lahore. Compare monthly rent, size, bedrooms and photos, and contact landlords and agents directly.`;
  }
  if (!ctx.landing && ctx.location) {
    return `Explore ${n}${noun} for rent in ${locName} — houses, portions, flats and commercial space. See monthly rents, photos and contact details.`;
  }
  return `${total > 0 ? `${formatNumber(total)} ${noun}` : `${ctx.landing!.pluralName}`} available for rent in ${locName}. Filter by rent, size and amenities to shortlist the right place.`;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { ctx, filters, result } = await load(props);
  const { titleBase } = listingHeadings(ctx);
  const cleanPath = listingPath({ type: ctx.landing?.slug, area: ctx.location?.slug, page: ctx.page });
  const refined = hasRefinements(filters);
  const pageSuffix = ctx.page > 1 ? ` – Page ${ctx.page}` : "";
  return pageMetadata({
    title: `${titleBase}${pageSuffix} | RentNest Lahore`,
    description: `${description(ctx, result.total)}${ctx.page > 1 ? ` Page ${ctx.page}.` : ""}`,
    path: cleanPath,
    // Filtered URLs canonicalise to the clean (unfiltered) page and are not indexed.
    canonicalPath: refined ? listingPath({ type: ctx.landing?.slug, area: ctx.location?.slug }) : cleanPath,
    noindex: !indexable(ctx, filters, result.total),
    image: result.items[0]?.images[0]?.url,
  });
}

export default async function RentListingPage(props: Props) {
  const { ctx, filters, result } = await load(props);
  const { h1, typeName } = listingHeadings(ctx);
  const options = await getFilterOptions();
  const refined = hasRefinements(filters);

  const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "Rent", path: "/rent/" }];
  if (ctx.landing) crumbs.push({ name: ctx.landing.pluralName, path: listingPath({ type: ctx.landing.slug }) });
  if (ctx.parentLocation) crumbs.push({ name: ctx.parentLocation.name, path: listingPath({ area: ctx.parentLocation.slug, type: ctx.landing?.slug }) });
  if (ctx.location) crumbs.push({ name: ctx.location.name, path: listingPath({ area: ctx.location.slug, type: ctx.landing?.slug }) });

  const from = (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.total, result.page * result.pageSize);

  return (
    <div className="container-page py-6 lg:py-8">
      <Breadcrumbs items={crumbs} />
      <header className="mt-4 max-w-3xl">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{h1}</h1>
        <p className="mt-2 text-[15px] leading-7 text-ink-600">{intro(ctx, result.total)}</p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
        <aside className="min-w-0">
          <FilterForm filters={filters} types={options.types} locations={options.locations} amenities={options.amenities} resultCount={result.total} />
        </aside>

        <section aria-label="Rental results" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-600" aria-live="polite">
              {result.total > 0 ? (
                <>
                  Showing <strong className="text-ink-900">{from}–{to}</strong> of <strong className="text-ink-900">{formatNumber(result.total)}</strong> {countNoun(ctx, result.total)} for rent
                </>
              ) : (
                "0 results"
              )}
            </p>
            {result.total > 1 && <SortSelect filters={filters} />}
          </div>

          {result.items.length === 0 ? (
            <EmptyResults clearHref={listingPath({ type: ctx.landing?.slug, area: ctx.location?.slug })} hasFilters={refined} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((p, i) => (
                <PropertyCard key={p.id} property={p} priority={i < 3} />
              ))}
            </div>
          )}

          <Pagination page={result.page} totalPages={result.totalPages} hrefFor={(n) => listingHref(filters, n)} />

          {result.items.length > 0 && (
            <JsonLd data={itemListJsonLd(result.items.map((p) => ({ name: p.title, path: `/property/${p.slug}/` })), from - 1)} />
          )}
        </section>
      </div>

      {ctx.page === 1 && !refined && <ListingSeoContent ctx={ctx} />}
      {refined && (
        <p className="mt-10 text-center text-sm text-ink-500">
          <Link href={listingPath({ type: ctx.landing?.slug, area: ctx.location?.slug })} className="font-semibold text-brick-700 hover:underline">
            See all {typeName.toLowerCase()} for rent in {ctx.location?.name ?? "Lahore"}
          </Link>
        </p>
      )}
    </div>
  );
}

function intro(ctx: ListingContext, total: number): string {
  const { locName } = listingHeadings(ctx);
  const noun = countNoun(ctx, total);
  const count = total > 0 ? `${formatNumber(total)} active` : "No active";
  if (!ctx.landing && !ctx.location) {
    return `${count} ${total === 1 ? "rental listing" : "rental listings"} across Lahore. Narrow down by property type, area, monthly rent, bedrooms, size and amenities.`;
  }
  if (ctx.landing && !ctx.location) {
    return `${count} ${noun} for rent across Lahore. Use the filters to pick an area, set your monthly budget and choose the size you need.`;
  }
  if (!ctx.landing && ctx.location) {
    return `${count} ${total === 1 ? "rental listing" : "rental listings"} in ${locName}. Filter by property type, rent and size, or read the area overview below.`;
  }
  return `${count} ${noun} for rent in ${locName}. Compare rents and sizes, then contact the landlord or agent directly.`;
}
