import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell } from "@/components/account/AccountShell";
import { PasswordForm, ProfileForm } from "@/components/account/ProfileForms";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Profile | RentNest Lahore", robots: PRIVATE_ROBOTS };

export default async function ProfilePage() {
  const user = await requireUser("/profile/");
  const agent = await prisma.agent.findUnique({ where: { userId: user.id } });
  return (
    <AccountShell user={user} active="/profile/" title="Profile" actions={agent ? <Link href={`/agents/${agent.slug}/`} className="btn-outline">View public profile</Link> : undefined}>
      <div className="space-y-6">
        <ProfileForm
          hasAgent={!!agent}
          values={{ name: user.name, email: user.email, phone: user.phone ?? "", agency: agent?.agency ?? "", about: agent?.about ?? "", whatsapp: agent?.whatsapp ?? "" }}
        />
        <PasswordForm />
      </div>
    </AccountShell>
  );
}
