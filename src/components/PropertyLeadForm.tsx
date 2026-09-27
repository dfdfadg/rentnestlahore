"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import { useState } from "react";
import { submitPropertyLead } from "@/app/actions/property-leads";
import { FieldError, FormMessage } from "./ui/FormBits";

export function PropertyLeadForm({ types, areas, defaultIntent = "BUY" }: { types: string[]; areas: string[]; defaultIntent?: "BUY" | "SELL" }) {
  const [state, action, pending] = useFormAction(submitPropertyLead, undefined);
  const [intent, setIntent] = useState<"BUY" | "SELL">(defaultIntent);
  if (state?.ok) return <FormMessage state={state} />;
  const selling = intent === "SELL";
  return (
    <form onSubmit={action} className="card space-y-4 p-5 sm:p-7" noValidate>
      <div className="hidden" aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
      <FormMessage state={state} />
      <fieldset>
        <legend className="label">I want to</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["BUY", "SELL"] as const).map((v) => (
            <label key={v} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-ink-200 px-4 py-3 font-semibold has-[:checked]:border-ink-900 has-[:checked]:bg-ink-900 has-[:checked]:text-white">
              <input type="radio" name="intent" value={v} checked={intent === v} onChange={() => setIntent(v)} className="sr-only" />
              {v === "BUY" ? "Buy a property" : "Sell my property"}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="l-type">Property type</label>
          <select id="l-type" name="propertyType" className="input" defaultValue="">
            <option value="">Any / not sure</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
            <option value="Plot">Plot</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="l-area">{selling ? "Property location *" : "Preferred areas *"}</label>
          <input id="l-area" name="area" list="l-area-list" required maxLength={200} className="input" placeholder={selling ? "e.g. DHA Phase 6, Block C" : "e.g. Johar Town, DHA"} />
          <datalist id="l-area-list">{areas.map((a) => <option key={a} value={a} />)}</datalist>
          <FieldError state={state} name="area" />
        </div>
        <div>
          <label className="label" htmlFor="l-size">Size</label>
          <input id="l-size" name="size" maxLength={60} className="input" placeholder="e.g. 10 Marla, 1 Kanal" />
        </div>
        <div>
          <label className="label" htmlFor="l-time">Timeline</label>
          <select id="l-time" name="timeline" className="input" defaultValue="">
            <option value="">Not decided</option>
            <option value="Within 1 month">Within 1 month</option>
            <option value="1–3 months">1–3 months</option>
            <option value="3–6 months">3–6 months</option>
            <option value="Just exploring">Just exploring</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:col-span-2">
          <div>
            <label className="label" htmlFor="l-min">{selling ? "Expected price (PKR)" : "Budget from (PKR)"}</label>
            <input id="l-min" name="budgetMin" type="number" inputMode="numeric" min={0} className="input" />
          </div>
          {!selling && (
            <div>
              <label className="label" htmlFor="l-max">Budget up to (PKR)</label>
              <input id="l-max" name="budgetMax" type="number" inputMode="numeric" min={0} className="input" />
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="l-notes">Details</label>
        <textarea id="l-notes" name="notes" rows={3} maxLength={1500} className="input" placeholder={selling ? "Corner, park facing, documents status, anything else…" : "What are you looking for?"} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="l-name">Name *</label>
          <input id="l-name" name="name" required autoComplete="name" maxLength={80} className="input" />
          <FieldError state={state} name="name" />
        </div>
        <div>
          <label className="label" htmlFor="l-phone">Mobile / WhatsApp *</label>
          <input id="l-phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" className="input" placeholder="03XX XXXXXXX" />
          <FieldError state={state} name="phone" />
        </div>
        <div>
          <label className="label" htmlFor="l-email">Email</label>
          <input id="l-email" name="email" type="email" autoComplete="email" className="input" />
          <FieldError state={state} name="email" />
        </div>
      </div>
      <label className="flex items-start gap-2 text-sm text-ink-700">
        <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-brick-600" />
        <span>I agree that RentNest Lahore shares my details with its partner property consultant, who will contact me about buying or selling.</span>
      </label>
      <FieldError state={state} name="consent" />
      <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto sm:px-10">{pending ? "Sending…" : "Request free consultation"}</button>
    </form>
  );
}
