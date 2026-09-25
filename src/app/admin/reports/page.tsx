import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { StatusBadge } from "@/components/account/AccountShell";
import { ReportStatusButtons } from "@/components/admin/SmallActions";
import { REPORT_REASONS } from "@/lib/validation";
import { formatDate } from "@/lib/format";

export default async function AdminReports() {
  await requireAdmin();
  const reports = await prisma.report.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 200, include: { property: { select: { id: true, title: true, slug: true } } } });
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Reported listings</h1>
      <ul className="mt-5 space-y-3">
        {reports.length === 0 && <li className="text-sm text-ink-500">No reports.</li>}
        {reports.map((r) => (
          <li key={r.id} className="card p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><StatusBadge status={r.status} /><span className="text-ink-500">{formatDate(r.createdAt)}</span></div>
              {r.status === "OPEN" && <ReportStatusButtons id={r.id} />}
            </div>
            <p className="mt-2 font-semibold">{REPORT_REASONS[r.reason as keyof typeof REPORT_REASONS] ?? r.reason}</p>
            {r.details && <p className="mt-1 whitespace-pre-line">{r.details}</p>}
            <p className="mt-2 text-ink-600">
              Listing: <Link href={`/admin/properties/${r.property.id}/edit/`} className="text-brick-700 hover:underline">{r.property.title}</Link>
              {r.email && <> · reporter: {r.email}</>}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
