"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, LayoutDashboard, LogOut, Shield, User } from "lucide-react";
import { useSession } from "../SessionProvider";
import { logoutAction } from "@/app/actions/auth";

export function AccountMenu() {
  const { user, loaded } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  if (!loaded) return <div className="hidden h-10 w-36 md:block" aria-hidden="true" />;

  if (!user) {
    return (
      <div className="hidden items-center gap-1 md:flex">
        <Link href="/login/" className="btn-ghost">Login</Link>
        <Link href="/register/" className="btn-outline">Register</Link>
      </div>
    );
  }

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        type="button"
        className="btn-ghost"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="max-w-28 truncate">{user.name.split(" ")[0]}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-lift">
          <MenuLink href="/dashboard/" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</MenuLink>
          <MenuLink href="/favorites/" icon={<Heart className="h-4 w-4" />}>Saved rentals</MenuLink>
          <MenuLink href="/my-properties/" icon={<LayoutDashboard className="h-4 w-4" />}>My properties</MenuLink>
          <MenuLink href="/profile/" icon={<User className="h-4 w-4" />}>Profile</MenuLink>
          {user.role === "ADMIN" && <MenuLink href="/admin/" icon={<Shield className="h-4 w-4" />}>Admin dashboard</MenuLink>}
          <form action={logoutAction} className="border-t border-ink-100">
            <button type="submit" role="menuitem" className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink-700 hover:bg-ink-50">
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} role="menuitem" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50">
      {icon}
      {children}
    </Link>
  );
}
