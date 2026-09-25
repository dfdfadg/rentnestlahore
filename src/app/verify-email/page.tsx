import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyEmailForm } from "@/components/auth/AuthForms";
import { requireUser, safeNext } from "@/lib/auth";
import { needsEmailVerification } from "@/lib/email-verification";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Verify your email | RentNest Lahore", robots: PRIVATE_ROBOTS };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await requireUser("/verify-email/");
  if (!needsEmailVerification(user)) redirect(safeNext(next));
  return (
    <AuthShell
      title="Verify your email"
      subtitle={`We've sent a 6-digit code to ${user.email}. Enter it below to finish creating your account. Check your spam folder if you don't see it.`}
    >
      <VerifyEmailForm next={next} />
    </AuthShell>
  );
}
