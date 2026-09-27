"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import { submitRequirement } from "@/app/actions/requirements";
import { FieldError, FormMessage } from "./ui/FormBits";

export function RequirementForm({ types, areas }: { types: string[]; areas: string[] }) {
  const [state, action, pending] = useFormAction(submitRequirement, undefined);
  if (state?.ok) return <FormMessage state={state} />;
  return (
    <form onSubmit={action} className="card space-y-4 p-5 sm:p-7" noValidate>
      <div className="hidden" aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="r-type">What do you need?</label>
          <select id="r-type" name="propertyType" className="input" defaultValue="">
            <option value="">Any property</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="r-areas">Preferred areas *</label>
          <input id="r-areas" name="areas" list="r-area-list" className="input" placeholder="e.g. Johar Town, Wapda Town" required maxLength={300} />
          <datalist id="r-area-list">{areas.map((a) => <option key={a} value={a} />)}</datalist>
          <FieldError state={state} name="areas" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label" htmlFor="r-min">Budget from (PKR)</label>
            <input id="r-min" name="budgetMin" type="number" inputMode="numeric" min={0} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="r-max">Budget up to (PKR)</label>
            <input id="r-max" name="budgetMax" type="number" inputMode="numeric" min={0} className="input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label" htmlFor="r-beds">Bedrooms</label>
            <input id="r-beds" name="bedrooms" type="number" inputMode="numeric" min={0} max={20} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="r-move">Move-in</label>
            <input id="r-move" name="moveIn" className="input" placeholder="e.g. next month" maxLength={40} />
          </div>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="r-notes">Anything else?</label>
        <textarea id="r-notes" name="notes" rows={3} maxLength={1500} className="input" placeholder="Family size, furnished/unfurnished, parking, near a school or office…" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="r-name">Name *</label>
          <input id="r-name" name="name" required autoComplete="name" className="input" maxLength={80} />
          <FieldError state={state} name="name" />
        </div>
        <div>
          <label className="label" htmlFor="r-phone">Mobile / WhatsApp *</label>
          <input id="r-phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" className="input" placeholder="03XX XXXXXXX" />
          <FieldError state={state} name="phone" />
        </div>
        <div>
          <label className="label" htmlFor="r-email">Email</label>
          <input id="r-email" name="email" type="email" autoComplete="email" className="input" />
          <FieldError state={state} name="email" />
        </div>
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto sm:px-10">{pending ? "Sending…" : "Send my requirement"}</button>
      <p className="text-xs text-ink-500">We share your requirement only with landlords and agents who may have a matching rental in Lahore.</p>
    </form>
  );
}
