import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountShell, StatusBadge } from "@/components/account/AccountShell";
import { PropertyForm } from "@/components/manage/PropertyForm";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getFormOptions, propertyToFormValues } from "@/lib/form-options";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Edit listing | RentNest Lahore", robots: PRIVATE_ROBOTS };

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/my-properties/${id}/edit/`);
  const p = await prisma.property.findUnique({ where: { id }, include: { amenities: { select: { id: true } }, agent: true } });
  if (!p || p.agent.userId !== user.id) notFound();
  const options = await getFormOptions();
  return (
    <AccountShell user={user} active="/my-properties/" title="Edit listing" actions={<Link href={`/my-properties/${id}/photos/`} className="btn-outline">Manage photos</Link>}>
      <div className="mb-5 flex items-center gap-2 text-sm text-ink-600"><StatusBadge status={p.status} /> {p.title}</div>
      {p.status === "PUBLISHED" && (
        <p className="mb-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
          Editing a live listing sends it back for a quick review before the changes go live.
        </p>
      )}
      <PropertyForm mode="user" values={{ ...propertyToFormValues(p), contactPhone: p.agent.phone, contactWhatsapp: p.agent.whatsapp ?? "" }} {...options} />
    </AccountShell>
  );
}
