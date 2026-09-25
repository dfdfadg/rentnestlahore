import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { UserAdminControls } from "@/components/admin/SmallActions";
import { formatDate } from "@/lib/format";

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const me = await requireAdmin();
  const { q } = await searchParams;
  const users = await prisma.user.findMany({
    where: q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, name: true, email: true, phone: true, role: true, disabled: true, createdAt: true, lastLoginAt: true, _count: { select: { favorites: true } }, agent: { select: { _count: { select: { properties: true } } } } },
  });
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Users</h1>
      <form className="mt-4 flex gap-2" method="get">
        <input name="q" defaultValue={q} placeholder="Search name or email" className="input w-72" />
        <button className="btn-dark">Search</button>
      </form>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-ink-50 text-xs uppercase text-ink-500">
            <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Last login</th><th className="px-4 py-3">Listings</th><th className="px-4 py-3">Saved</th><th className="px-4 py-3">Role / status</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map((u) => (
              <tr key={u.id} className={u.disabled ? "opacity-60" : ""}>
                <td className="px-4 py-3"><p className="font-semibold">{u.name}</p><p className="text-ink-500">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p></td>
                <td className="px-4 py-3">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "—"}</td>
                <td className="px-4 py-3">{u.agent?._count.properties ?? 0}</td>
                <td className="px-4 py-3">{u._count.favorites}</td>
                <td className="px-4 py-3">{u.id === me.id ? <span className="text-xs text-ink-500">You ({u.role.toLowerCase()})</span> : <UserAdminControls id={u.id} role={u.role} disabled={u.disabled} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
