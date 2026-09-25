import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { PropertyForm } from "@/components/manage/PropertyForm";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getFormOptions } from "@/lib/form-options";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Post a rental property | RentNest Lahore", robots: PRIVATE_ROBOTS };

export default async function NewPropertyPage() {
  const user = await requireUser("/my-properties/new/");
  const [options, agent] = await Promise.all([getFormOptions(), prisma.agent.findUnique({ where: { userId: user.id } })]);
  return (
    <AccountShell user={user} active="/my-properties/" title="Post a rental property">
      <ol className="mb-6 flex flex-wrap gap-2 text-sm">
        <li className="badge bg-ink-900 px-3 py-1 text-white">1. Details</li>
        <li className="badge bg-ink-100 px-3 py-1 text-ink-600">2. Photos</li>
        <li className="badge bg-ink-100 px-3 py-1 text-ink-600">3. Review & publish</li>
      </ol>
      <PropertyForm
        mode="user"
        values={{ contactPhone: agent?.phone ?? user.phone ?? "", contactWhatsapp: agent?.whatsapp ?? "" }}
        {...options}
      />
    </AccountShell>
  );
}
