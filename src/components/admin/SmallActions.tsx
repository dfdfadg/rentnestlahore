"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteAmenity, setReportStatus, updateUserAdmin } from "@/app/actions/admin";

export function ReportStatusButtons({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const set = (s: "OPEN" | "RESOLVED" | "DISMISSED") => start(async () => { await setReportStatus(id, s); router.refresh(); });
  return (
    <div className="flex gap-1">
      <button disabled={pending} onClick={() => set("RESOLVED")} className="btn-outline min-h-8 px-2 py-1 text-xs">Resolve</button>
      <button disabled={pending} onClick={() => set("DISMISSED")} className="btn-ghost min-h-8 px-2 py-1 text-xs">Dismiss</button>
    </div>
  );
}

export function UserAdminControls({ id, role, disabled }: { id: string; role: string; disabled: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Role"
        defaultValue={role}
        disabled={pending}
        className="input min-h-8 w-auto py-1 text-xs"
        onChange={(e) => start(async () => { const r = await updateUserAdmin(id, { role: e.target.value as "USER" | "AGENT" | "ADMIN" }); if (r?.message && !r.ok) alert(r.message); router.refresh(); })}
      >
        <option value="USER">User</option>
        <option value="AGENT">Agent</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button
        disabled={pending}
        onClick={() => start(async () => { const r = await updateUserAdmin(id, { disabled: !disabled }); if (r?.message && !r.ok) alert(r.message); router.refresh(); })}
        className={`btn min-h-8 px-2 py-1 text-xs ${disabled ? "bg-emerald-600 text-white" : "bg-red-50 text-red-700"}`}
      >
        {disabled ? "Enable" : "Disable"}
      </button>
    </div>
  );
}

export function DeleteAmenityButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button disabled={pending} onClick={() => confirm("Delete this amenity? It will be removed from all listings.") && start(async () => { await deleteAmenity(id); router.refresh(); })} className="text-xs font-semibold text-red-600 hover:underline">
      Delete
    </button>
  );
}
