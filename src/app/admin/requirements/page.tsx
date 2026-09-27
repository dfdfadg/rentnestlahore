import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { RequirementStatus } from "@/components/admin/RequirementStatus";
import { StatusBadge } from "@/components/account/AccountShell";
import { formatDate, formatPKR } from "@/lib/format";

export default async function AdminRequirements() {
  await requireAdmin();
  const items = await prisma.rentRequirement.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 300 });
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Renter requirements</h1>
      <p className="mt-1 text-sm text-ink-500">Leads from people looking to rent. Share them with agents/landlords who have matching properties. It gives agents a strong reason for agents to list with you.</p>
      <ul className="mt-5 space-y-3">
        {items.length === 0 && <li className="text-sm text-ink-500">No requirements yet.</li>}
        {items.map((r) => (
          <li key={r.id} className="card p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><StatusBadge status={r.status} /><span className="text-ink-500">{formatDate(r.createdAt)}</span></div>
              <RequirementStatus id={r.id} status={r.status} />
            </div>
            <p className="mt-2 font-semibold">
              {r.propertyType ?? "Any property"} in {r.areas}
              {r.bedrooms ? ` · ${r.bedrooms}+ beds` : ""}
              {r.budgetMin || r.budgetMax ? ` · ${r.budgetMin ? formatPKR(r.budgetMin) : "…"} to ${r.budgetMax ? formatPKR(r.budgetMax) : "…"}` : ""}
              {r.moveIn ? ` · move-in: ${r.moveIn}` : ""}
            </p>
            {r.notes && <p className="mt-1 whitespace-pre-line text-ink-700">{r.notes}</p>}
            <p className="mt-2 flex flex-wrap gap-x-4 text-ink-600">
              <span>{r.name}</span>
              <a className="text-brick-700 hover:underline" href={`tel:${r.phone}`}>{r.phone}</a>
              <a className="text-emerald-700 hover:underline" href={`https://wa.me/${r.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              {r.email && <a className="text-brick-700 hover:underline" href={`mailto:${r.email}`}>{r.email}</a>}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
