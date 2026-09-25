"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  resendVerificationAction,
  resetPasswordAction,
  verifyEmailAction,
} from "@/app/actions/auth";
import { FieldError, FormMessage } from "../ui/FormBits";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage state={state} />
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        <FieldError state={state} name="email" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">Password</label>
          <Link href="/forgot-password/" className="mb-1.5 text-xs font-semibold text-brick-700 hover:underline">Forgot password?</Link>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
        <FieldError state={state} name="password" />
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full">{pending ? "Logging in…" : "Log in"}</button>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(registerAction, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <FormMessage state={state} />
      <div>
        <label htmlFor="name" className="label">Full name</label>
        <input id="name" name="name" autoComplete="name" required className="input" maxLength={80} />
        <FieldError state={state} name="name" />
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        <FieldError state={state} name="email" />
      </div>
      <div>
        <label htmlFor="phone" className="label">Mobile number</label>
        <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="03XX XXXXXXX" required className="input" />
        <FieldError state={state} name="phone" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="input" />
          <FieldError state={state} name="password" />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="label">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className="input" />
          <FieldError state={state} name="confirmPassword" />
        </div>
      </div>
      <p className="text-xs text-ink-500">At least 8 characters, including a letter and a number.</p>
      <button type="submit" disabled={pending} className="btn-primary w-full">{pending ? "Creating account…" : "Create account"}</button>
      <p className="text-xs text-ink-500">
        By creating an account you agree to our <Link href="/terms/" className="underline">Terms</Link> and <Link href="/privacy/" className="underline">Privacy Policy</Link>.
      </p>
    </form>
  );
}

export function VerifyEmailForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(verifyEmailAction, undefined);
  const [resendState, resend, resending] = useActionState(resendVerificationAction, undefined);
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4" noValidate>
        <input type="hidden" name="next" value={next ?? ""} />
        <FormMessage state={state} />
        <div>
          <label htmlFor="code" className="label">6-digit code</label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            placeholder="123456"
            className="input text-center text-2xl font-bold tracking-[0.5em]"
          />
          <FieldError state={state} name="code" />
        </div>
        <button type="submit" disabled={pending} className="btn-primary w-full">{pending ? "Checking…" : "Verify email"}</button>
      </form>
      <form action={resend} className="text-center">
        <FormMessage state={resendState} />
        <button type="submit" disabled={resending} className="mt-2 text-sm font-semibold text-brick-700 hover:underline disabled:opacity-60">
          {resending ? "Sending…" : "Didn't get it? Send a new code"}
        </button>
      </form>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, undefined);
  if (state?.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        <FieldError state={state} name="email" />
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full">{pending ? "Sending…" : "Send reset link"}</button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <div>
        <label htmlFor="password" className="label">New password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required className="input" />
        <FieldError state={state} name="password" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="label">Confirm new password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className="input" />
        <FieldError state={state} name="confirmPassword" />
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full">{pending ? "Saving…" : "Set new password"}</button>
    </form>
  );
}
