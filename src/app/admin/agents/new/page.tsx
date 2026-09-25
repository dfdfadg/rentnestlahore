import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AgentForm } from "@/components/admin/AgentForm";

export default async function AdminNewAgent() {
  await requireAdmin();
  const locations = await prisma.location.findMany({ where: { active: true, parentId: null }, orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <div className="max-w-3xl">
      <h1 className="mb-5 text-2xl font-extrabold">Add agent / landlord</h1>
      <div className="card p-6"><AgentForm locations={locations} /></div>
    </div>
  );
}
