"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setRequirementStatus } from "@/app/actions/requirements";

export function RequirementStatus({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <select
      aria-label="Requirement status"
      defaultValue={status}
      disabled={pending}
      className="input min-h-9 w-auto py-1 text-xs"
      onChange={(e) => start(async () => { await setRequirementStatus(id, e.target.value as "NEW"); router.refresh(); })}
    >
      {["NEW", "CONTACTED", "MATCHED", "CLOSED", "SPAM"].map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
    </select>
  );
}
