import Link from "next/link";
import type { EnquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { StatusBadge } from "@/components/account/AccountShell";
import { EnquiryStatusSelect } from "@/components/account/EnquiryStatusSelect";
import { formatDate } from "@/lib/format";

const STATUSES: EnquiryStatus[] = ["NEW", "CONTACTED", "CLOSED", "SPAM"];

export default async function AdminEnquiries({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const s = STATUSES.includes(status as EnquiryStatus) ? (status as EnquiryStatus) : undefined;
  const items = await prisma.enquiry.findMany({
    where: s ? { status: s } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { property: { select: { title: true, slug: true } }, agent: { select: { name: true } } },
  });
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Enquiries</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/enquiries/" className={!s ? "btn-dark" : "btn-outline"}>All</Link>
        {STATUSES.map((x) => <Link key={x} href={`/admin/enquiries/?status=${x}`} className={s === x ? "btn-dark" : "btn-outline"}>{x.toLowerCase()}</Link>)}
      </div>
      <ul className="mt-5 space-y-3">
        {items.length === 0 && <li className="text-sm text-ink-500">No enquiries.</li>}
        {items.map((e) => (
          <li key={e.id} className="card p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><StatusBadge status={e.status} /><span className="text-ink-500">{formatDate(e.createdAt)} · to {e.agent?.name ?? "—"}</span></div>
              <EnquiryStatusSelect id={e.id} status={e.status} />
            </div>
            {e.property && <p className="mt-2">Re: <Link className="font-semibold text-brick-700 hover:underline" href={`/property/${e.property.slug}/`}>{e.property.title}</Link></p>}
            <p className="mt-1 whitespace-pre-line">{e.message}</p>
            <p className="mt-2 text-ink-600">{e.name} · {e.phone}{e.email ? ` · ${e.email}` : ""} · prefers {e.preferredContact.toLowerCase()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
