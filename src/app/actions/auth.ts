"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  hashToken,
  newToken,
  safeNext,
  verifyPassword,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { checkVerificationCode, emailVerificationEnabled, sendVerificationCode } from "@/lib/email-verification";
import { absoluteUrl } from "@/lib/site";
import { emailSchema, firstErrors, loginSchema, normalizePhone, passwordSchema, registerSchema } from "@/lib/validation";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> } | undefined;

// Constant-time-ish failure path: compare against a dummy hash when the user does not exist.
const DUMMY_HASH = "$2b$12$BGut/Gt.ref8MjYkr98lLuG0Ens0Y3z58kRq9X3zHSEWS3JzS1ZAK";

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { errors: firstErrors(parsed.error) };
  // Per account+IP brute-force limit, plus a looser per-IP ceiling (many users share carrier/office IPs).
  const ip = await clientIp();
  if (!(await rateLimit("login-ip", 50, 15 * 60_000, ip)) || !(await rateLimit("login-account", 8, 15 * 60_000, `${ip}:${parsed.data.email}`))) {
    return { message: "Too many login attempts. Please wait a few minutes and try again." };
  }
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return { message: "Incorrect email or password." };
  if (user.disabled) return { message: "This account has been disabled. Please contact support." };
  await createSession(user.id);
  redirect(safeNext(formData.get("next")?.toString(), user.role === "ADMIN" ? "/admin/" : "/dashboard/"));
}

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await rateLimit("register", 5, 60 * 60_000))) {
    return { message: "Too many sign-ups from this network. Please try again later." };
  }
  if (formData.get("website")) return { message: "Unable to create account." }; // honeypot
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    password: formData.get("password"),
  });
  if (!parsed.success) return { errors: firstErrors(parsed.error) };
  if (formData.get("password") !== formData.get("confirmPassword")) {
    return { errors: { confirmPassword: "Passwords do not match" } };
  }
  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (exists) return { errors: { email: "An account with this email already exists. Try logging in." } };
  const verify = emailVerificationEnabled();
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: normalizePhone(parsed.data.phone),
      passwordHash: await hashPassword(parsed.data.password),
      emailVerifiedAt: verify ? null : new Date(),
    },
  });
  await createSession(user.id);
  const next = safeNext(formData.get("next")?.toString(), "/dashboard/");
  if (verify) {
    await sendVerificationCode(user);
    redirect(`/verify-email/?next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

export async function verifyEmailAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Please log in again." };
  const next = safeNext(formData.get("next")?.toString(), "/dashboard/");
  if (user.emailVerified) redirect(next);
  if (!(await rateLimit("verify-email", 20, 15 * 60_000, user.id))) {
    return { message: "Too many attempts. Please wait a few minutes and try again." };
  }
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { errors: { code: "Enter the 6-digit code from the email" } };
  const result = await checkVerificationCode(user.id, code);
  if (result === "ok") redirect(next);
  if (result === "invalid") return { errors: { code: "That code is not correct. Please check the email and try again." } };
  return { message: "This code has expired or been used too many times. Tap “Send a new code”." };
}

export async function resendVerificationAction(): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Please log in again." };
  if (user.emailVerified) return { ok: true, message: "Your email is already verified." };
  if (!(await rateLimit("resend-code", 5, 60 * 60_000, user.id))) {
    return { message: "You've requested several codes. Please wait a while before asking for another." };
  }
  const sent = await sendVerificationCode(user);
  if (!sent) return { message: "We couldn't send the email right now. Please try again in a minute." };
  return { ok: true, message: `A new code has been sent to ${user.email}.` };
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await rateLimit("forgot", 5, 60 * 60_000))) {
    return { message: "Too many requests. Please try again later." };
  }
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { errors: { email: "Enter a valid email address" } };
  const generic: FormState = {
    ok: true,
    message: "If an account exists for that email, we've sent a link to reset your password. It expires in 1 hour.",
  };
  const user = await prisma.user.findUnique({ where: { email: parsed.data } });
  if (!user || user.disabled) return generic;
  const token = newToken();
  await prisma.passwordResetToken.create({
    data: { tokenHash: hashToken(token), userId: user.id, expiresAt: new Date(Date.now() + 3_600_000) },
  });
  const link = absoluteUrl(`/reset-password/?token=${token}`);
  const sent = await sendEmail({
    to: user.email,
    subject: "Reset your RentNest Lahore password",
    text: `Hello ${user.name},\n\nUse the link below to set a new password. It expires in 1 hour.\n\n${link}\n\nIf you did not request this, you can ignore this email.\n\n— RentNest Lahore`,
  });
  if (!sent) return { message: "We couldn't send the email right now. Please try again later or contact support." };
  return generic;
}

export async function resetPasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await rateLimit("reset", 10, 60 * 60_000))) return { message: "Too many attempts. Please try again later." };
  const token = String(formData.get("token") ?? "");
  const pw = passwordSchema.safeParse(formData.get("password"));
  if (!pw.success) return { errors: { password: pw.error.issues[0].message } };
  if (formData.get("password") !== formData.get("confirmPassword")) return { errors: { confirmPassword: "Passwords do not match" } };
  const rec = token ? await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } }) : null;
  if (!rec || rec.usedAt || rec.expiresAt < new Date()) {
    return { message: "This reset link is invalid or has expired. Please request a new one." };
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: rec.userId }, data: { passwordHash: await hashPassword(pw.data) } }),
    prisma.passwordResetToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: rec.userId } }),
  ]);
  await createSession(rec.userId);
  redirect("/dashboard/");
}
