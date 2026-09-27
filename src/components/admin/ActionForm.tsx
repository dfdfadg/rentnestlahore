"use client";

import { useFormAction } from "@/components/ui/useFormAction";
import type { FormState } from "@/app/actions/auth";
import { FormMessage } from "../ui/FormBits";

/** Generic client wrapper to show validation messages for admin server-action forms. */
export function ActionForm({
  action,
  children,
  submitLabel = "Save",
  className = "space-y-4",
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useFormAction(action, undefined);
  return (
    <form onSubmit={formAction} className={className}>
      <FormMessage state={state} />
      {state?.errors && (
        <ul className="text-sm text-red-600">
          {Object.entries(state.errors).map(([k, v]) => <li key={k}>{k}: {v}</li>)}
        </ul>
      )}
      {children}
      <button type="submit" disabled={pending} className="btn-primary">{pending ? "Saving…" : submitLabel}</button>
    </form>
  );
}
