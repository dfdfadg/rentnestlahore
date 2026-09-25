"use client";

import { useActionState } from "react";
import { changePassword, updateProfile } from "@/app/actions/account";
import { FieldError, FormMessage } from "../ui/FormBits";

export function ProfileForm({ values, hasAgent }: { values: { name: string; email: string; phone: string; agency: string; about: string; whatsapp: string }; hasAgent: boolean }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="card space-y-4 p-6" noValidate>
      <h2 className="text-lg font-bold">Your details</h2>
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pr-name" className="label">Name</label>
          <input id="pr-name" name="name" defaultValue={values.name} className="input" required />
          <FieldError state={state} name="name" />
        </div>
        <div>
          <label htmlFor="pr-email" className="label">Email</label>
          <input id="pr-email" value={values.email} disabled className="input bg-ink-50" />
        </div>
        <div>
          <label htmlFor="pr-phone" className="label">Phone</label>
          <input id="pr-phone" name="phone" type="tel" defaultValue={values.phone} className="input" />
          <FieldError state={state} name="phone" />
        </div>
        {hasAgent && (
          <div>
            <label htmlFor="pr-wa" className="label">WhatsApp</label>
            <input id="pr-wa" name="whatsapp" type="tel" defaultValue={values.whatsapp} className="input" />
            <FieldError state={state} name="whatsapp" />
          </div>
        )}
      </div>
      {hasAgent && (
        <>
          <div>
            <label htmlFor="pr-agency" className="label">Agency (optional)</label>
            <input id="pr-agency" name="agency" defaultValue={values.agency} maxLength={120} className="input" />
          </div>
          <div>
            <label htmlFor="pr-about" className="label">About (shown on your public profile)</label>
            <textarea id="pr-about" name="about" rows={4} maxLength={2000} defaultValue={values.about} className="input" />
          </div>
        </>
      )}
      <button type="submit" disabled={pending} className="btn-primary">{pending ? "Saving…" : "Save profile"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="card space-y-4 p-6" noValidate>
      <h2 className="text-lg font-bold">Change password</h2>
      <FormMessage state={state} />
      <div>
        <label htmlFor="pw-cur" className="label">Current password</label>
        <input id="pw-cur" name="currentPassword" type="password" autoComplete="current-password" className="input" />
        <FieldError state={state} name="currentPassword" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pw-new" className="label">New password</label>
          <input id="pw-new" name="newPassword" type="password" autoComplete="new-password" className="input" />
          <FieldError state={state} name="newPassword" />
        </div>
        <div>
          <label htmlFor="pw-conf" className="label">Confirm</label>
          <input id="pw-conf" name="confirmPassword" type="password" autoComplete="new-password" className="input" />
          <FieldError state={state} name="confirmPassword" />
        </div>
      </div>
      <button type="submit" disabled={pending} className="btn-outline">{pending ? "Saving…" : "Change password"}</button>
    </form>
  );
}
