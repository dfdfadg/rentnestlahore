import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveLocation } from "@/app/actions/admin";
import { ActionForm } from "@/components/admin/ActionForm";

type Loc = { id: string; name: string; slug: string; parentId: string | null; description: string | null; latitude: number | null; longitude: number | null; isPopular: boolean; active: boolean; sortOrder: number };

function LocationFields({ l, parents }: { l?: Loc; parents: { id: string; name: string }[] }) {
  return (
    <>
      {l && <input type="hidden" name="id" value={l.id} />}
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className="label">Name</label><input name="name" defaultValue={l?.name} required className="input" /></div>
        <div><label className="label">URL slug</label><input name="slug" defaultValue={l?.slug} className="input" placeholder="auto from name" /></div>
        <div>
          <label className="label">Parent area</label>
          <select name="parentId" defaultValue={l?.parentId ?? ""} className="input">
            <option value="">— none (top level) —</option>
            {parents.filter((p) => p.id !== l?.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div><label className="label">Latitude</label><input name="latitude" type="number" step="any" defaultValue={l?.latitude ?? ""} className="input" /></div>
        <div><label className="label">Longitude</label><input name="longitude" type="number" step="any" defaultValue={l?.longitude ?? ""} className="input" /></div>
        <div><label className="label">Order</label><input name="sortOrder" type="number" defaultValue={l?.sortOrder ?? 0} className="input" /></div>
      </div>
      <div><label className="label">Area overview (shown on the area page)</label><textarea name="description" rows={3} defaultValue={l?.description ?? ""} className="input" /></div>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="isPopular" defaultChecked={l?.isPopular} className="h-4 w-4 accent-brick-600" /> Popular (homepage)</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={l?.active ?? true} className="h-4 w-4 accent-brick-600" /> Active</label>
      </div>
    </>
  );
}

export default async function AdminLocations() {
  await requireAdmin();
  const locs = await prisma.location.findMany({ orderBy: [{ parentId: "asc" }, { name: "asc" }], include: { _count: { select: { properties: true } } } });
  const roots = locs.filter((l) => !l.parentId);
  const parents = roots.map((r) => ({ id: r.id, name: r.name }));
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Lahore locations</h1>
      <p className="mt-1 text-sm text-ink-500">Add new areas without code changes. Each active area gets a page at /rent/&lt;slug&gt;/ (indexed once it has listings).</p>
      <details className="card mt-5 p-5">
        <summary className="cursor-pointer font-semibold">Add location</summary>
        <div className="mt-4"><ActionForm action={saveLocation} submitLabel="Add location"><LocationFields parents={parents} /></ActionForm></div>
      </details>
      <ul className="mt-5 space-y-2">
        {roots.map((r) => (
          <li key={r.id}>
            <LocationRow l={r} count={r._count.properties} parents={parents} />
            {locs.filter((c) => c.parentId === r.id).map((c) => (
              <div key={c.id} className="ml-6 mt-2"><LocationRow l={c} count={c._count.properties} parents={parents} /></div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LocationRow({ l, count, parents }: { l: Loc; count: number; parents: { id: string; name: string }[] }) {
  return (
    <details className="card p-3">
      <summary className="cursor-pointer text-sm"><strong>{l.name}</strong> <span className="text-ink-500">· /rent/{l.slug}/ · {count} listings{l.isPopular ? " · popular" : ""}{l.active ? "" : " · inactive"}</span></summary>
      <div className="mt-4"><ActionForm action={saveLocation}><LocationFields l={l} parents={parents} /></ActionForm></div>
    </details>
  );
}
