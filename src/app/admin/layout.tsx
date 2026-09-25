import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Admin | RentNest Lahore", robots: PRIVATE_ROBOTS };

const NAV = [
  ["/admin/", "Overview"],
  ["/admin/properties/", "Properties"],
  ["/admin/properties/new/", "Add property"],
  ["/admin/import/", "CSV import"],
  ["/admin/enquiries/", "Enquiries"],
  ["/admin/reports/", "Reports"],
  ["/admin/agents/", "Agents"],
  ["/admin/users/", "Users"],
  ["/admin/locations/", "Locations"],
  ["/admin/property-types/", "Property types"],
  ["/admin/amenities/", "Amenities"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="container-page py-6">
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto rounded-2xl bg-ink-900 p-2 lg:sticky lg:top-20 lg:flex-col lg:self-start">
          <p className="hidden px-3 py-2 text-xs font-semibold uppercase tracking-wider text-brick-400 lg:block">Admin</p>
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="shrink-0 rounded-lg px-3 py-2 text-sm text-ink-200 hover:bg-white/10 hover:text-white">{label}</Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
