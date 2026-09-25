import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Inbox, ListPlus, PlusCircle } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Dashboard | RentNest Lahore", robots: PRIVATE_ROBOTS };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard/");
  const agent = await prisma.agent.findUnique({ where: { userId: user.id }, select: { id: true } });
  const [byStatus, newEnquiries, favorites, views] = await Promise.all([
    agent ? prisma.property.groupBy({ by: ["status"], where: { agentId: agent.id }, _count: { _all: true } }) : [],
    agent ? prisma.enquiry.count({ where: { agentId: agent.id, status: "NEW" } }) : 0,
    prisma.favorite.count({ where: { userId: user.id } }),
    agent ? prisma.property.aggregate({ where: { agentId: agent.id }, _sum: { views: true } }) : null,
  ]);
  const count = (s: string) => byStatus.find((b) => b.status === s)?._count._all ?? 0;
  const stats = [
    { label: "Live listings", value: count("PUBLISHED"), href: "/my-properties/" },
    { label: "Pending review", value: count("PENDING_REVIEW"), href: "/my-properties/" },
    { label: "Drafts", value: count("DRAFT"), href: "/my-properties/" },
    { label: "New enquiries", value: newEnquiries, href: "/my-enquiries/" },
    { label: "Saved rentals", value: favorites, href: "/favorites/" },
    { label: "Listing views", value: views?._sum.views ?? 0, href: "/my-properties/" },
  ];
  return (
    <AccountShell user={user} active="/dashboard/" title={`Hello, ${user.name.split(" ")[0]}`}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 hover:shadow-lift">
            <p className="text-3xl font-extrabold">{s.value.toLocaleString("en-US")}</p>
            <p className="mt-1 text-sm text-ink-500">{s.label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/my-properties/new/" className="card flex items-center gap-3 p-5 hover:shadow-lift"><PlusCircle className="h-6 w-6 text-brick-600" /> <span className="font-semibold">Post a rental property</span></Link>
        <Link href="/rent/" className="card flex items-center gap-3 p-5 hover:shadow-lift"><ListPlus className="h-6 w-6 text-brick-600" /> <span className="font-semibold">Browse rentals</span></Link>
        <Link href="/favorites/" className="card flex items-center gap-3 p-5 hover:shadow-lift"><Heart className="h-6 w-6 text-brick-600" /> <span className="font-semibold">Your saved rentals</span></Link>
      </div>
      {newEnquiries > 0 && (
        <Link href="/my-enquiries/" className="mt-6 flex items-center gap-3 rounded-2xl bg-brick-50 p-4 text-brick-800 ring-1 ring-brick-200">
          <Inbox className="h-5 w-5" /> You have {newEnquiries} new enquir{newEnquiries === 1 ? "y" : "ies"} waiting.
        </Link>
      )}
    </AccountShell>
  );
}
