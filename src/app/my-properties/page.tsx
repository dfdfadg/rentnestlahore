import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell, StatusBadge } from "@/components/account/AccountShell";
import { ListingActions } from "@/components/account/ListingActions";
import { SmartImage } from "@/components/ui/SmartImage";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatPKR, propertyRef } from "@/lib/format";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "My properties | RentNest Lahore", robots: PRIVATE_ROBOTS };

export default async function MyPropertiesPage() {
  const user = await requireUser("/my-properties/");
  const agent = await prisma.agent.findUnique({ where: { userId: user.id }, select: { id: true } });
  const properties = agent
    ? await prisma.property.findMany({
        where: { agentId: agent.id },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true, slug: true, title: true, status: true, price: true, refNo: true, views: true, updatedAt: true, rejectionReason: true, expiresAt: true,
          images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
          _count: { select: { enquiries: true } },
        },
      })
    : [];
  return (
    <AccountShell user={user} active="/my-properties/" title="My properties" actions={<Link href="/my-properties/new/" className="btn-primary">Post property</Link>}>
      {properties.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-semibold">You haven&apos;t listed a property yet.</p>
          <p className="mt-1 text-sm text-ink-500">Listing is free. Every listing is reviewed before it goes live.</p>
          <Link href="/my-properties/new/" className="btn-primary mt-5">Post your first rental</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {properties.map((p) => (
            <li key={p.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:w-40">
                {p.images[0] ? <SmartImage src={p.images[0].url} alt="" fill sizes="160px" className="object-cover" /> : <span className="grid h-full place-items-center text-xs text-ink-400">No photo</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-ink-400">{propertyRef(p.refNo)} · Updated {formatDate(p.updatedAt)}</span>
                </div>
                <p className="mt-1 truncate font-semibold">{p.title}</p>
                <p className="text-sm text-ink-600">{formatPKR(p.price)} · {p.views} views · {p._count.enquiries} enquiries{p.expiresAt ? ` · Expires ${formatDate(p.expiresAt)}` : ""}</p>
                {p.status === "REJECTED" && p.rejectionReason && <p className="mt-1 text-sm text-red-600">Rejected: {p.rejectionReason}</p>}
                <div className="mt-3"><ListingActions id={p.id} status={p.status} slug={p.slug} /></div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
