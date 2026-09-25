import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/AuthForms";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Set a new password | RentNest Lahore", robots: PRIVATE_ROBOTS, referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthShell title="Set a new password" footer={<Link href="/login/" className="font-semibold text-brick-700 hover:underline">Back to log in</Link>}>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-sm text-ink-600">
          This reset link is missing its token. <Link href="/forgot-password/" className="font-semibold text-brick-700 underline">Request a new link</Link>.
        </p>
      )}
    </AuthShell>
  );
}
