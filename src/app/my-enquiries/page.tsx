import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell, StatusBadge } from "@/components/account/AccountShell";
import { EnquiryStatusSelect } from "@/components/account/EnquiryStatusSelect";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Enquiries | RentNest Lahore", robots: PRIVATE_ROBOTS };

export default async function MyEnquiriesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const user = await requireUser("/my-enquiries/");
  const agent = await prisma.agent.findUnique({ where: { userId: user.id }, select: { id: true } });
  const sent = tab === "sent";
  const enquiries = sent
    ? await prisma.enquiry.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100, include: { property: { select: { title: true, slug: true, status: true } } } })
    : agent
      ? await prisma.enquiry.findMany({ where: { agentId: agent.id }, orderBy: { createdAt: "desc" }, take: 200, include: { property: { select: { title: true, slug: true, status: true } } } })
      : [];
  return (
    <AccountShell user={user} active="/my-enquiries/" title="Enquiries">
      <div className="mb-5 flex gap-2">
        <Link href="/my-enquiries/" className={sent ? "btn-outline" : "btn-dark"}>Received</Link>
        <Link href="/my-enquiries/?tab=sent" className={sent ? "btn-dark" : "btn-outline"}>Sent by me</Link>
      </div>
      {enquiries.length === 0 ? (
        <div className="card p-10 text-center text-ink-600">
          {sent ? "You haven't sent any enquiries while logged in." : "No enquiries yet. Enquiries on your listings will appear here."}
        </div>
      ) : (
        <ul className="space-y-3">
          {enquiries.map((e) => (
            <li key={e.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={e.status} />
                  <span className="text-xs text-ink-500">{formatDate(e.createdAt)}</span>
                </div>
                {!sent && <EnquiryStatusSelect id={e.id} status={e.status} />}
              </div>
              {e.property && (
                <p className="mt-2 text-sm">
                  Re: {e.property.status === "PUBLISHED" ? <Link href={`/property/${e.property.slug}/`} className="font-semibold text-brick-700 hover:underline">{e.property.title}</Link> : <span className="font-semibold">{e.property.title}</span>}
                </p>
              )}
              <p className="mt-2 whitespace-pre-line text-[15px] text-ink-800">{e.message}</p>
              {!sent && (
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-600">
                  <span><strong>{e.name}</strong></span>
                  <a href={`tel:${e.phone}`} className="text-brick-700 hover:underline">{e.phone}</a>
                  {e.email && <a href={`mailto:${e.email}`} className="text-brick-700 hover:underline">{e.email}</a>}
                  <span>Prefers: {e.preferredContact.toLowerCase()}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
