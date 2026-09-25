import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { StatusBadge } from "@/components/account/AccountShell";
import { AdminPropertyActions } from "@/components/admin/AdminPropertyActions";
import { formatDate, formatPKR } from "@/lib/format";

export default async function AdminHome() {
  await requireAdmin();
  const [byStatus, users, agents, newEnq, openReports, demo, pending] = await Promise.all([
    prisma.property.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.count(),
    prisma.agent.count(),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.property.count({ where: { isDemo: true } }),
    prisma.property.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { updatedAt: "asc" },
      take: 10,
      select: { id: true, slug: true, title: true, status: true, price: true, featured: true, verified: true, updatedAt: true, agent: { select: { name: true } }, _count: { select: { images: true } } },
    }),
  ]);
  const c = (s: string) => byStatus.find((b) => b.status === s)?._count._all ?? 0;
  const stats = [
    ["Published", c("PUBLISHED"), "/admin/properties/?status=PUBLISHED"],
    ["Pending review", c("PENDING_REVIEW"), "/admin/properties/?status=PENDING_REVIEW"],
    ["Drafts", c("DRAFT"), "/admin/properties/?status=DRAFT"],
    ["Rented", c("RENTED"), "/admin/properties/?status=RENTED"],
    ["Expired", c("EXPIRED"), "/admin/properties/?status=EXPIRED"],
    ["Rejected", c("REJECTED"), "/admin/properties/?status=REJECTED"],
    ["New enquiries", newEnq, "/admin/enquiries/"],
    ["Open reports", openReports, "/admin/reports/"],
    ["Users", users, "/admin/users/"],
    ["Agents", agents, "/admin/agents/"],
  ] as const;
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Admin dashboard</h1>
      {demo > 0 && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
          {demo} demo listings are in the database. Remove them before launch with <code className="font-mono">npm run db:remove-demo</code>, or filter them in <Link href="/admin/properties/?demo=1" className="underline">Properties</Link>.
        </p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map(([label, value, href]) => (
          <Link key={label} href={href} className="card p-4 hover:shadow-lift">
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-sm text-ink-500">{label}</p>
          </Link>
        ))}
      </div>
      <h2 className="mt-10 text-lg font-bold">Moderation queue</h2>
      {pending.length === 0 ? (
        <p className="mt-3 text-sm text-ink-500">Nothing waiting for review.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {pending.map((p) => (
            <li key={p.id} className="card p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
                <StatusBadge status={p.status} /> {p.agent.name} · {formatPKR(p.price)} · {p._count.images} photos · updated {formatDate(p.updatedAt)}
              </div>
              <p className="mt-1 font-semibold">{p.title}</p>
              <div className="mt-2"><AdminPropertyActions id={p.id} slug={p.slug} status={p.status} featured={p.featured} verified={p.verified} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
