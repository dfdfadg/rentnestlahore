import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ImageManager } from "@/components/manage/ImageManager";
import { StatusBadge } from "@/components/account/AccountShell";
import { AdminPropertyActions } from "@/components/admin/AdminPropertyActions";

export default async function AdminPhotos({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const p = await prisma.property.findUnique({
    where: { id },
    select: { id: true, slug: true, title: true, status: true, featured: true, verified: true, images: { orderBy: { position: "asc" }, select: { id: true, url: true, alt: true } } },
  });
  if (!p) notFound();
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Photos</h1>
        <Link href={`/admin/properties/${id}/edit/`} className="btn-outline">Edit details</Link>
      </div>
      <div className="mb-5 flex items-center gap-2 text-sm"><StatusBadge status={p.status} /> {p.title}</div>
      <div className="mb-6"><AdminPropertyActions id={p.id} slug={p.slug} status={p.status} featured={p.featured} verified={p.verified} /></div>
      <ImageManager propertyId={p.id} initial={p.images} />
    </div>
  );
}
