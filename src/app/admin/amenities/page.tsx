import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveAmenity } from "@/app/actions/admin";
import { ActionForm } from "@/components/admin/ActionForm";
import { DeleteAmenityButton } from "@/components/admin/SmallActions";

export default async function AdminAmenities() {
  await requireAdmin();
  const amenities = await prisma.amenity.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { _count: { select: { properties: true } } } });
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold">Amenities</h1>
      <div className="card mt-5 p-5">
        <ActionForm action={saveAmenity} submitLabel="Add amenity" className="flex flex-wrap items-end gap-3">
          <div><label className="label" htmlFor="am-name">Name</label><input id="am-name" name="name" className="input" required /></div>
          <div>
            <label className="label" htmlFor="am-group">Group</label>
            <select id="am-group" name="group" className="input"><option value="general">General</option><option value="utilities">Utilities</option><option value="commercial">Commercial</option></select>
          </div>
        </ActionForm>
      </div>
      <ul className="card mt-5 divide-y divide-ink-100">
        {amenities.map((a) => (
          <li key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span><strong>{a.name}</strong> <span className="text-ink-500">· {a.group} · used by {a._count.properties} listings</span></span>
            <DeleteAmenityButton id={a.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
