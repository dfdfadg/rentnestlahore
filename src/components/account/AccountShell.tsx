import Link from "next/link";
import { Heart, Inbox, LayoutDashboard, ListPlus, Shield, User } from "lucide-react";
import type { CurrentUser } from "@/lib/auth";

const LINKS = [
  { href: "/dashboard/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-properties/", label: "My properties", icon: ListPlus },
  { href: "/my-enquiries/", label: "Enquiries", icon: Inbox },
  { href: "/favorites/", label: "Saved rentals", icon: Heart },
  { href: "/profile/", label: "Profile", icon: User },
];

export function AccountShell({ user, active, title, actions, children }: { user: CurrentUser; active: string; title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="container-page py-8">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Account" className="flex gap-1 overflow-x-auto lg:flex-col">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active === href ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium ${active === href ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100"}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
          {user.role === "ADMIN" && (
            <Link href="/admin/" className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-brick-700 hover:bg-brick-50">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-extrabold">{title}</h1>
            {actions}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    PENDING_REVIEW: "bg-amber-50 text-amber-800 ring-amber-200",
    DRAFT: "bg-ink-50 text-ink-600 ring-ink-200",
    REJECTED: "bg-red-50 text-red-700 ring-red-200",
    EXPIRED: "bg-ink-100 text-ink-600 ring-ink-200",
    RENTED: "bg-sky-50 text-sky-700 ring-sky-200",
    NEW: "bg-brick-50 text-brick-700 ring-brick-200",
    CONTACTED: "bg-sky-50 text-sky-700 ring-sky-200",
    CLOSED: "bg-ink-50 text-ink-600 ring-ink-200",
    SPAM: "bg-red-50 text-red-700 ring-red-200",
    OPEN: "bg-amber-50 text-amber-800 ring-amber-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    DISMISSED: "bg-ink-50 text-ink-600 ring-ink-200",
  };
  return <span className={`badge ring-1 ${styles[status] ?? "bg-ink-50 text-ink-600 ring-ink-200"}`}>{status.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</span>;
}
