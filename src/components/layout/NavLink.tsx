"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const pathname = usePathname() || "/";
  const active = href === "/" ? pathname === "/" : pathname === href || (href !== "/rent/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-ink-50 text-ink-900" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
      } ${className}`}
    >
      {children}
    </Link>
  );
}
