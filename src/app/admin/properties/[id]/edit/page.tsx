import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PropertyForm } from "@/components/manage/PropertyForm";
import { getFormOptions, propertyToFormValues } from "@/lib/form-options";

export default async function AdminEditProperty({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const p = await prisma.property.findUnique({ where: { id }, include: { amenities: { select: { id: true } } } });
  if (!p) notFound();
  const [options, agents] = await Promise.all([getFormOptions(), prisma.agent.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })]);
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Edit: {p.title}</h1>
        <div className="flex gap-2">
          <Link href={`/admin/properties/${id}/photos/`} className="btn-outline">Photos</Link>
          <Link href={`/admin/properties/${id}/preview/`} className="btn-outline">Preview</Link>
        </div>
      </div>
      <PropertyForm mode="admin" values={propertyToFormValues(p)} agents={agents} {...options} />
    </div>
  );
}
