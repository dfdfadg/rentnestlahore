import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Forgot password | RentNest Lahore", robots: PRIVATE_ROBOTS };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email you registered with and we'll send you a secure reset link."
      footer={<Link href="/login/" className="font-semibold text-brick-700 hover:underline">Back to log in</Link>}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
