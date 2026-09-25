import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountShell, StatusBadge } from "@/components/account/AccountShell";
import { ImageManager } from "@/components/manage/ImageManager";
import { SubmitForReviewButton } from "@/components/account/ListingActions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Listing photos | RentNest Lahore", robots: PRIVATE_ROBOTS };

export default async function PhotosPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const user = await requireUser(`/my-properties/${id}/photos/`);
  const p = await prisma.property.findUnique({
    where: { id },
    select: { id: true, title: true, status: true, agent: { select: { userId: true } }, images: { orderBy: { position: "asc" }, select: { id: true, url: true, alt: true } } },
  });
  if (!p || p.agent.userId !== user.id) notFound();
  const canSubmit = ["DRAFT", "REJECTED", "EXPIRED"].includes(p.status);
  return (
    <AccountShell user={user} active="/my-properties/" title="Photos" actions={<Link href={`/my-properties/${id}/edit/`} className="btn-outline">Edit details</Link>}>
      {isNew && <p className="mb-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200">Details saved. Now add photos — the first photo is used as the cover image.</p>}
      <div className="mb-5 flex items-center gap-2 text-sm text-ink-600"><StatusBadge status={p.status} /> {p.title}</div>
      <ImageManager propertyId={p.id} initial={p.images} />
      <div className="mt-8 card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{canSubmit ? "Ready to go live?" : p.status === "PENDING_REVIEW" ? "Your listing is waiting for review" : "Listing status"}</p>
          <p className="text-sm text-ink-500">{canSubmit ? "Submit your listing and our team will review it, usually within one working day." : "You can keep editing photos at any time."}</p>
        </div>
        {canSubmit ? <SubmitForReviewButton id={p.id} /> : <Link href="/my-properties/" className="btn-outline">Back to my properties</Link>}
      </div>
    </AccountShell>
  );
}
