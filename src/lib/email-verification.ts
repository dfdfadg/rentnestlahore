import "server-only";
import { randomInt, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { hashToken, requireUser, type CurrentUser } from "./auth";
import { sendEmail } from "./email";

const CODE_TTL_MS = 15 * 60_000;
const MAX_ATTEMPTS = 5;

/** Email OTP is only enforced once an email provider is configured, so sign-up never dead-ends. */
export function emailVerificationEnabled(): boolean {
  return !!process.env.RESEND_API_KEY?.trim();
}

export function needsEmailVerification(user: CurrentUser): boolean {
  return emailVerificationEnabled() && !user.emailVerified && user.role !== "ADMIN";
}

/** Like requireUser, but sends unverified accounts to the code-entry page first. */
export async function requireVerifiedUser(nextPath = "/dashboard/"): Promise<CurrentUser> {
  const user = await requireUser(nextPath);
  if (needsEmailVerification(user)) redirect(`/verify-email/?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/** Issues a fresh 6-digit code (older codes stop working) and emails it. */
export async function sendVerificationCode(user: { id: string; name: string; email: string }): Promise<boolean> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.$transaction([
    prisma.emailVerificationCode.deleteMany({ where: { userId: user.id } }),
    prisma.emailVerificationCode.create({
      data: { userId: user.id, codeHash: hashToken(code), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
    }),
  ]);
  return sendEmail({
    to: user.email,
    subject: `${code} is your RentNest Lahore verification code`,
    text: `Hello ${user.name},\n\nYour RentNest Lahore verification code is:\n\n${code}\n\nIt expires in 15 minutes. If you did not create an account, you can ignore this email.\n\n— RentNest Lahore`,
  });
}

export type VerifyResult = "ok" | "invalid" | "expired" | "locked";

export async function checkVerificationCode(userId: string, code: string): Promise<VerifyResult> {
  const rec = await prisma.emailVerificationCode.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
  if (!rec || rec.expiresAt < new Date()) return "expired";
  if (rec.attempts >= MAX_ATTEMPTS) return "locked";
  const a = Buffer.from(hashToken(code));
  const b = Buffer.from(rec.codeHash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    await prisma.emailVerificationCode.update({ where: { id: rec.id }, data: { attempts: { increment: 1 } } });
    return rec.attempts + 1 >= MAX_ATTEMPTS ? "locked" : "invalid";
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailVerificationCode.deleteMany({ where: { userId } }),
  ]);
  return "ok";
}
