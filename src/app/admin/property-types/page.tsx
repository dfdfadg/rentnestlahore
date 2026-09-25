import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { savePropertyType } from "@/app/actions/admin";
import { ActionForm } from "@/components/admin/ActionForm";

function TypeFields({ t }: { t?: { id: string; name: string; pluralName: string; pluralSlug: string; category: string; description: string | null; active: boolean; sortOrder: number } }) {
  return (
    <>
      {t && <input type="hidden" name="id" value={t.id} />}
      <div className="grid gap-3 sm:grid-cols-5">
        <div><label className="label">Name</label><input name="name" defaultValue={t?.name} required className="input" /></div>
        <div><label className="label">Plural</label><input name="pluralName" defaultValue={t?.pluralName} required className="input" /></div>
        <div><label className="label">URL slug</label><input name="pluralSlug" defaultValue={t?.pluralSlug} className="input" placeholder="auto" /></div>
        <div>
          <label className="label">Category</label>
          <select name="category" defaultValue={t?.category ?? "RESIDENTIAL"} className="input"><option value="RESIDENTIAL">Residential</option><option value="COMMERCIAL">Commercial</option></select>
        </div>
        <div><label className="label">Order</label><input name="sortOrder" type="number" defaultValue={t?.sortOrder ?? 0} className="input" /></div>
      </div>
      <div><label className="label">Landing page description</label><textarea name="description" rows={2} defaultValue={t?.description ?? ""} className="input" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={t?.active ?? true} className="h-4 w-4 accent-brick-600" /> Active</label>
    </>
  );
}

export default async function AdminPropertyTypes() {
  await requireAdmin();
  const types = await prisma.propertyType.findMany({ orderBy: [{ sortOrder: "asc" }], include: { _count: { select: { properties: true } } } });
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Property types</h1>
      <p className="mt-1 text-sm text-ink-500">Each active type gets a landing page at /rent/&lt;url slug&gt;/.</p>
      <details className="card mt-5 p-5" open={types.length === 0}>
        <summary className="cursor-pointer font-semibold">Add property type</summary>
        <div className="mt-4"><ActionForm action={savePropertyType} submitLabel="Add type"><TypeFields /></ActionForm></div>
      </details>
      <ul className="mt-5 space-y-3">
        {types.map((t) => (
          <li key={t.id}>
            <details className="card p-4">
              <summary className="cursor-pointer text-sm"><strong>{t.name}</strong> <span className="text-ink-500">· /rent/{t.pluralSlug}/ · {t.category.toLowerCase()} · {t._count.properties} listings{t.active ? "" : " · inactive"}</span></summary>
              <div className="mt-4"><ActionForm action={savePropertyType}><TypeFields t={t} /></ActionForm></div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
