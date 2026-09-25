import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Log in | RentNest Lahore", robots: PRIVATE_ROBOTS };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(safeNext(next));
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to save rentals, manage your listings and view enquiries."
      footer={<>New to RentNest Lahore? <Link href={`/register/${q}`} className="font-semibold text-brick-700 hover:underline">Create an account</Link></>}
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
