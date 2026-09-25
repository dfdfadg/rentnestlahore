import Link from "next/link";
import type { Prisma, PropertyStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { StatusBadge } from "@/components/account/AccountShell";
import { AdminPropertyActions } from "@/components/admin/AdminPropertyActions";
import { formatDate, formatPKR, propertyRef } from "@/lib/format";

const STATUSES: PropertyStatus[] = ["PENDING_REVIEW", "PUBLISHED", "DRAFT", "RENTED", "EXPIRED", "REJECTED"];
const PER_PAGE = 30;

export default async function AdminProperties({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as PropertyStatus) ? (sp.status as PropertyStatus) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim().slice(0, 80);
  const where: Prisma.PropertyWhereInput = {
    ...(status ? { status } : {}),
    ...(sp.demo === "1" ? { isDemo: true } : sp.demo === "0" ? { isDemo: false } : {}),
    ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q } }, ...(/^\d+$/.test(q.replace(/^RN-/i, "")) ? [{ refNo: Number(q.replace(/^RN-/i, "")) }] : [])] } : {}),
  };
  const [total, items] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true, slug: true, title: true, status: true, price: true, refNo: true, featured: true, verified: true, isDemo: true, updatedAt: true, views: true,
        location: { select: { name: true } }, agent: { select: { name: true } }, _count: { select: { images: true, enquiries: true } },
      },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const qs = (extra: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ status, q, demo: sp.demo, ...extra })) if (v !== undefined && v !== "") p.set(k, String(v));
    const s = p.toString();
    return `/admin/properties/${s ? `?${s}` : ""}`;
  };
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Properties <span className="text-base font-medium text-ink-500">({total})</span></h1>
        <Link href="/admin/properties/new/" className="btn-primary">Add property</Link>
      </div>
      <form className="mt-4 flex flex-wrap gap-2" method="get">
        <input name="q" defaultValue={q} placeholder="Search title, slug or RN-ID" className="input w-64" />
        <select name="status" defaultValue={status ?? ""} className="input w-44">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <select name="demo" defaultValue={sp.demo ?? ""} className="input w-40">
          <option value="">Real + demo</option>
          <option value="0">Real only</option>
          <option value="1">Demo only</option>
        </select>
        <button className="btn-dark">Filter</button>
      </form>
      <ul className="mt-5 space-y-3">
        {items.map((p) => (
          <li key={p.id} className="card p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
              <StatusBadge status={p.status} />
              {p.isDemo && <span className="badge bg-amber-200 text-amber-900">Demo</span>}
              <span>{propertyRef(p.refNo)}</span>·<span>{p.location.name}</span>·<span>{p.agent.name}</span>·<span>{p._count.images} photos</span>·<span>{p._count.enquiries} enquiries</span>·<span>{p.views} views</span>·<span>updated {formatDate(p.updatedAt)}</span>
            </div>
            <p className="mt-1 font-semibold">{p.title} <span className="font-normal text-ink-500">— {formatPKR(p.price)}</span></p>
            <div className="mt-2"><AdminPropertyActions id={p.id} slug={p.slug} status={p.status} featured={p.featured} verified={p.verified} /></div>
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <nav className="mt-6 flex gap-2" aria-label="Pagination">
          {page > 1 && <Link href={qs({ page: page - 1 })} className="btn-outline">Previous</Link>}
          <span className="self-center text-sm text-ink-500">Page {page} of {pages}</span>
          {page < pages && <Link href={qs({ page: page + 1 })} className="btn-outline">Next</Link>}
        </nav>
      )}
    </div>
  );
}
