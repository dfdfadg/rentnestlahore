"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { MAIN_NAV } from "./nav";
import { useSession } from "../SessionProvider";
import { logoutAction } from "@/app/actions/auth";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useSession();

  // Close when navigating
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="btn-ghost -mr-2 px-2.5 xl:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      {open && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-white xl:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col py-4">
            {MAIN_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="border-b border-ink-100 py-3.5 text-base font-medium text-ink-800">
                {item.label}
              </Link>
            ))}
            <div className="mt-6 grid gap-3">
              <Link href="/my-properties/new/" className="btn-primary">Post Property</Link>
              {user ? (
                <>
                  <Link href="/dashboard/" className="btn-outline">Dashboard</Link>
                  <Link href="/favorites/" className="btn-outline">Saved rentals</Link>
                  {user.role === "ADMIN" && <Link href="/admin/" className="btn-outline">Admin dashboard</Link>}
                  <form action={logoutAction}>
                    <button type="submit" className="btn-ghost w-full">Log out</button>
                  </form>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login/" className="btn-outline">Login</Link>
                  <Link href="/register/" className="btn-dark">Register</Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
