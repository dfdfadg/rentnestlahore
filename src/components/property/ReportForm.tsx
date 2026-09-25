"use client";

import { useActionState } from "react";
import { Flag } from "lucide-react";
import { submitReport } from "@/app/actions/public";
import { REPORT_REASONS } from "@/lib/validation";
import { FieldError, FormMessage } from "../ui/FormBits";

export function ReportForm({ propertyId }: { propertyId: string }) {
  const [state, action, pending] = useActionState(submitReport, undefined);
  return (
    <details className="group rounded-xl border border-ink-100 bg-white">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 text-sm font-medium text-ink-600 hover:text-ink-900">
        <Flag className="h-4 w-4" /> Report this property
      </summary>
      <div className="border-t border-ink-100 p-4">
        {state?.ok ? (
          <FormMessage state={state} />
        ) : (
          <form action={action} className="space-y-3">
            <input type="hidden" name="propertyId" value={propertyId} />
            <FormMessage state={state} />
            <div>
              <label htmlFor="rep-reason" className="label">Reason</label>
              <select id="rep-reason" name="reason" className="input" required defaultValue="">
                <option value="" disabled>Select a reason</option>
                {Object.entries(REPORT_REASONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <FieldError state={state} name="reason" />
            </div>
            <div>
              <label htmlFor="rep-details" className="label">Details (optional)</label>
              <textarea id="rep-details" name="details" rows={3} maxLength={1000} className="input" />
            </div>
            <div>
              <label htmlFor="rep-email" className="label">Your email (optional)</label>
              <input id="rep-email" name="email" type="email" className="input" />
              <FieldError state={state} name="email" />
            </div>
            <button type="submit" disabled={pending} className="btn-outline w-full">{pending ? "Sending…" : "Submit report"}</button>
          </form>
        )}
      </div>
    </details>
  );
}
