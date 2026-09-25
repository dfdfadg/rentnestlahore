import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PropertyForm } from "@/components/manage/PropertyForm";
import { getFormOptions } from "@/lib/form-options";

export default async function AdminNewProperty() {
  await requireAdmin();
  const [options, agents] = await Promise.all([getFormOptions(), prisma.agent.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })]);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Add rental property</h1>
      <PropertyForm mode="admin" values={{ status: "DRAFT" }} agents={agents} {...options} />
    </div>
  );
}
