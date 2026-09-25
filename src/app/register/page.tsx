import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/AuthForms";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Create an account | RentNest Lahore", robots: PRIVATE_ROBOTS };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(safeNext(next));
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <AuthShell
      title="Create your account"
      subtitle="Save rentals, list your property for rent and manage enquiries — free."
      footer={<>Already have an account? <Link href={`/login/${q}`} className="font-semibold text-brick-700 hover:underline">Log in</Link></>}
    >
      <RegisterForm next={next} />
    </AuthShell>
  );
}
