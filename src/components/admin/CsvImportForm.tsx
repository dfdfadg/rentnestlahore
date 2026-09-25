"use client";

import { useActionState } from "react";
import { runCsvImport } from "@/app/actions/admin";
import type { ImportReport } from "@/lib/csv-import";

type State = { ok?: boolean; message?: string; report?: ImportReport } | undefined;

export function CsvImportForm() {
  const [state, action, pending] = useActionState(runCsvImport as (s: State, f: FormData) => Promise<State>, undefined);
  const report = state?.report;
  return (
    <div className="space-y-6">
      <form action={action} className="card space-y-4 p-6">
        <div>
          <label htmlFor="csv" className="label">CSV file</label>
          <input id="csv" name="file" type="file" accept=".csv,text/csv" required className="input py-2" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="demo" className="h-4 w-4 accent-brick-600" /> Mark imported rows as demo/sample data</label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" name="mode" value="validate" disabled={pending} className="btn-dark">{pending ? "Working…" : "1. Validate (dry run)"}</button>
          <button type="submit" name="mode" value="import" disabled={pending} className="btn-primary">2. Import valid rows</button>
        </div>
        <p className="text-xs text-ink-500">Always validate first. Imported rows default to <strong>Pending Review</strong> and appear in the moderation queue. Rows marked <em>published</em> without photos are kept in review.</p>
      </form>
      {state?.message && (
        <div className={`rounded-xl p-4 text-sm ring-1 ${state.ok ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-amber-50 text-amber-900 ring-amber-200"}`} role="status">{state.message}</div>
      )}
      {report && report.errors.length > 0 && (
        <div className="card overflow-hidden">
          <h2 className="border-b border-ink-100 px-4 py-3 font-bold">Rows with errors</h2>
          <ul className="max-h-96 divide-y divide-ink-100 overflow-y-auto text-sm">
            {report.errors.map((e) => (
              <li key={e.row} className="px-4 py-2"><strong>Row {e.row}:</strong> {e.messages.join("; ")}</li>
            ))}
          </ul>
        </div>
      )}
      {report && report.preview.length > 0 && (
        <div className="card overflow-hidden">
          <h2 className="border-b border-ink-100 px-4 py-3 font-bold">Valid rows</h2>
          <ul className="max-h-96 divide-y divide-ink-100 overflow-y-auto text-sm">
            {report.preview.map((p) => (
              <li key={p.row} className="flex justify-between gap-4 px-4 py-2"><span>Row {p.row}: {p.title}</span><span className="text-ink-500">{p.status}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
