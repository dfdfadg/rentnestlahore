import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AgentForm } from "@/components/admin/AgentForm";

export default async function AdminEditAgent({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [agent, locations] = await Promise.all([
    prisma.agent.findUnique({ where: { id }, include: { areasServed: { select: { id: true } } } }),
    prisma.location.findMany({ where: { active: true, parentId: null }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!agent) notFound();
  return (
    <div className="max-w-3xl">
      <h1 className="mb-5 text-2xl font-extrabold">Edit: {agent.name}</h1>
      <div className="card p-6"><AgentForm agent={agent} locations={locations} /></div>
    </div>
  );
}
