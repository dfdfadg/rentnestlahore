import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export default async function AdminAgents() {
  await requireAdmin();
  const agents = await prisma.agent.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { properties: true, enquiries: true } }, user: { select: { email: true } } } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Agents & landlords</h1>
        <Link href="/admin/agents/new/" className="btn-primary">Add agent</Link>
      </div>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-ink-50 text-xs uppercase text-ink-500"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Listings</th><th className="px-4 py-3">Enquiries</th><th className="px-4 py-3" /></tr></thead>
          <tbody className="divide-y divide-ink-100">
            {agents.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold">{a.name} {a.verified && <span className="badge bg-emerald-50 text-emerald-700">Verified</span>} {a.isDemo && <span className="badge bg-amber-200 text-amber-900">Demo</span>}</p>
                  <p className="text-ink-500">{a.agency ?? ""}{a.user ? ` · account: ${a.user.email}` : ""}</p>
                </td>
                <td className="px-4 py-3">{a.type.toLowerCase()}</td>
                <td className="px-4 py-3">{a.phone}</td>
                <td className="px-4 py-3">{a._count.properties}</td>
                <td className="px-4 py-3">{a._count.enquiries}</td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/agents/${a.id}/`} className="font-semibold text-brick-700 hover:underline">Edit</Link> · <Link href={`/agents/${a.slug}/`} className="text-ink-600 hover:underline">Profile</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
