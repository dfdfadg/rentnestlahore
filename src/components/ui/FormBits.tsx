import type { FormState } from "@/app/actions/auth";

export function FieldError({ state, name }: { state: FormState; name: string }) {
  const msg = state?.errors?.[name];
  if (!msg) return null;
  return <p className="mt-1 text-sm text-red-600" id={`${name}-error`} role="alert">{msg}</p>;
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state?.message) return null;
  return (
    <div role="status" className={`rounded-xl px-4 py-3 text-sm ${state.ok ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>
      {state.message}
    </div>
  );
}
