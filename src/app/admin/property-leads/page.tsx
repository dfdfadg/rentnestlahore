import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { StatusBadge } from "@/components/account/AccountShell";
import { PropertyLeadActions } from "@/components/admin/PropertyLeadActions";
import { formatDate, formatPKR } from "@/lib/format";

/** Partner consultant's WhatsApp (international format, e.g. 923001234567). */
const PARTNER = (process.env.PARTNER_WHATSAPP || "").replace(/[^\d]/g, "");

export default async function AdminPropertyLeads() {
  await requireAdmin();
  const leads = await prisma.propertyLead.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 300 });
  const counts = await prisma.propertyLead.groupBy({ by: ["status"], _count: { _all: true } });
  const c = (s: string) => counts.find((x) => x.status === s)?._count._all ?? 0;
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Buy / sell leads</h1>
      <p className="mt-1 text-sm text-ink-500">
        Consultation requests from the partner-service form. New {c("NEW")} · Forwarded {c("FORWARDED")} · Converted {c("CONVERTED")}.
      </p>
      {!PARTNER && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
          Set <code className="font-mono">PARTNER_WHATSAPP</code> in Vercel (e.g. 923001234567) to enable one-click forwarding. Until then, use &ldquo;Copy lead&rdquo;.
        </p>
      )}
      <ul className="mt-5 space-y-3">
        {leads.length === 0 && <li className="text-sm text-ink-500">No leads yet.</li>}
        {leads.map((l) => {
          const money = l.intent === "SELL"
            ? l.budgetMin ? `Expected price: ${formatPKR(l.budgetMin)}` : ""
            : l.budgetMin || l.budgetMax ? `Budget: ${l.budgetMin ? formatPKR(l.budgetMin) : "…"} – ${l.budgetMax ? formatPKR(l.budgetMax) : "…"}` : "";
          const text = [
            `RentNest lead (${l.intent === "BUY" ? "BUYER" : "SELLER"}) — ${formatDate(l.createdAt)}`,
            `Name: ${l.name}`,
            `Phone: ${l.phone}`,
            l.email ? `Email: ${l.email}` : "",
            `Type: ${l.propertyType ?? "Any"}`,
            `${l.intent === "SELL" ? "Location" : "Areas"}: ${l.area}`,
            l.size ? `Size: ${l.size}` : "",
            money,
            l.timeline ? `Timeline: ${l.timeline}` : "",
            l.notes ? `Notes: ${l.notes}` : "",
          ].filter(Boolean).join("\n");
          return (
            <li key={l.id} className="card p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`badge ${l.intent === "BUY" ? "bg-sky-50 text-sky-700" : "bg-brick-50 text-brick-700"}`}>{l.intent === "BUY" ? "Buyer" : "Seller"}</span>
                  <StatusBadge status={l.status} />
                  <span className="text-ink-500">{formatDate(l.createdAt)}{l.forwardedAt ? ` · forwarded ${formatDate(l.forwardedAt)}` : ""}</span>
                </div>
                <PropertyLeadActions id={l.id} status={l.status} text={text} partner={PARTNER} />
              </div>
              <p className="mt-2 font-semibold">{l.propertyType ?? "Any property"} · {l.area}{l.size ? ` · ${l.size}` : ""}{money ? ` · ${money}` : ""}{l.timeline ? ` · ${l.timeline}` : ""}</p>
              {l.notes && <p className="mt-1 whitespace-pre-line text-ink-700">{l.notes}</p>}
              <p className="mt-2 text-ink-600">{l.name} · <a href={`tel:${l.phone}`} className="text-brick-700 hover:underline">{l.phone}</a>{l.email ? ` · ${l.email}` : ""}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
