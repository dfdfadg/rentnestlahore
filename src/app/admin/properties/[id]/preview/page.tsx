import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { detailInclude } from "@/lib/properties";
import { propertyPageExtras } from "@/lib/property-page";
import { PropertyView } from "@/components/property/PropertyView";

/** Admin preview of any listing regardless of status (never indexed — admin layout sets noindex). */
export default async function AdminPreview({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const property = await prisma.property.findUnique({ where: { id }, include: detailInclude });
  if (!property) notFound();
  const extras = await propertyPageExtras(property);
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <PropertyView property={property} preview {...extras} />
    </div>
  );
}
