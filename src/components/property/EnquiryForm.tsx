"use client";

import { useActionState, useEffect } from "react";
import { submitEnquiry } from "@/app/actions/public";
import { FieldError, FormMessage } from "../ui/FormBits";
import { useSession } from "../SessionProvider";
import { track } from "@/lib/analytics";

export function EnquiryForm({ propertyId, title }: { propertyId: string; title: string }) {
  const [state, action, pending] = useActionState(submitEnquiry, undefined);
  const { user } = useSession();

  useEffect(() => {
    if (state?.ok) track("enquiry_submit", { property_id: propertyId });
  }, [state, propertyId]);

  if (state?.ok) {
    return <FormMessage state={state} />;
  }

  return (
    <form action={action} className="space-y-3" noValidate>
      <input type="hidden" name="propertyId" value={propertyId} />
      <div className="hidden" aria-hidden="true">
        <label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <FormMessage state={state} />
      <div>
        <label htmlFor="enq-name" className="label">Name</label>
        <input id="enq-name" name="name" className="input" autoComplete="name" required defaultValue={user?.name} maxLength={80} />
        <FieldError state={state} name="name" />
      </div>
      <div>
        <label htmlFor="enq-phone" className="label">Phone</label>
        <input id="enq-phone" name="phone" type="tel" inputMode="tel" className="input" autoComplete="tel" placeholder="03XX XXXXXXX" required />
        <FieldError state={state} name="phone" />
      </div>
      <div>
        <label htmlFor="enq-email" className="label">Email <span className="normal-case text-ink-400">(optional)</span></label>
        <input id="enq-email" name="email" type="email" className="input" autoComplete="email" />
        <FieldError state={state} name="email" />
      </div>
      <div>
        <label htmlFor="enq-msg" className="label">Message</label>
        <textarea
          id="enq-msg"
          name="message"
          rows={4}
          className="input"
          required
          maxLength={2000}
          defaultValue={`Hello, I am interested in "${title}". Is it still available? I'd like to arrange a visit.`}
        />
        <FieldError state={state} name="message" />
      </div>
      <fieldset>
        <legend className="label">Preferred contact</legend>
        <div className="flex flex-wrap gap-2">
          {[
            ["CALL", "Call"],
            ["WHATSAPP", "WhatsApp"],
            ["EMAIL", "Email"],
          ].map(([v, l], i) => (
            <label key={v} className="flex cursor-pointer items-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-sm has-[:checked]:border-ink-900 has-[:checked]:bg-ink-50">
              <input type="radio" name="preferredContact" value={v} defaultChecked={i === 0} className="accent-brick-600" /> {l}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Sending…" : "Send enquiry"}
      </button>
      <p className="text-xs text-ink-400">Your details are shared only with the landlord/agent of this listing.</p>
    </form>
  );
}
