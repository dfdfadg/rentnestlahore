import type { Metadata } from "next";
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPropertyBySlug } from "@/lib/properties";
import { propertyPageExtras } from "@/lib/property-page";
import { PropertyView } from "@/components/property/PropertyView";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { propertyJsonLd } from "@/lib/property-jsonld";
import { formatArea, formatPKR, FREQUENCY_LABEL } from "@/lib/format";

export const revalidate = 600;

export function generateStaticParams() {
  // Rendered on first request and then cached (ISR); nothing is prebuilt at deploy time.
  return [];
}

type Props = { params: Promise<{ slug: string }> };

const load = cache(async (slug: string) => {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) notFound();
  const property = await getPropertyBySlug(slug);
  if (!property) {
    const redirect = await prisma.slugRedirect.findUnique({ where: { oldSlug: slug }, include: { property: { select: { slug: true } } } });
    if (redirect) permanentRedirect(`/property/${redirect.property.slug}/`);
    notFound();
  }
  // Drafts, pending and rejected listings are never public.
  if (property.purpose !== "RENT" || ["DRAFT", "PENDING_REVIEW", "REJECTED"].includes(property.status)) notFound();
  const expired = property.status === "EXPIRED" || (property.expiresAt != null && property.expiresAt < new Date());
  const unavailableReason =
    property.status === "RENTED" ? "This property has been rented and is no longer available." : expired ? "This listing has expired and is no longer available." : null;
  return { property, unavailableReason };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { property: p, unavailableReason } = await load(slug);
  const place = [p.society, p.location.name].filter(Boolean).join(", ");
  const bits = [
    formatArea(p.area, p.areaUnit),
    p.bedrooms ? `${p.bedrooms} bed` : null,
    p.bathrooms ? `${p.bathrooms} bath` : null,
  ].filter(Boolean).join(", ");
  return pageMetadata({
    title: `${p.title} – ${formatPKR(p.price)}/${FREQUENCY_LABEL[p.priceFrequency]} | RentNest Lahore`,
    description: `${p.propertyType.name} for rent in ${place}, Lahore: ${bits}. Rent ${formatPKR(p.price)} per ${FREQUENCY_LABEL[p.priceFrequency]}. View photos, details and contact the ${p.agent.type === "LANDLORD" ? "landlord" : "agent"}.`,
    path: `/property/${p.slug}/`,
    image: p.images[0]?.url,
    noindex: !!unavailableReason || p.isDemo,
    type: "article",
  });
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const { property, unavailableReason } = await load(slug);
  const extras = await propertyPageExtras(property);
  return (
    <>
      <PropertyView property={property} unavailableReason={unavailableReason} {...extras} />
      {!unavailableReason && <JsonLd data={propertyJsonLd(property)} />}
    </>
  );
}
