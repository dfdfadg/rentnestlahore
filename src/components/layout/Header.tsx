import Link from "next/link";
import { Logo } from "./Logo";
import { MAIN_NAV } from "./nav";
import { AccountMenu } from "./AccountMenu";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />
        <nav aria-label="Main" className="ml-4 hidden flex-1 items-center gap-0.5 xl:flex">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <AccountMenu />
          <Link href="/my-properties/new/" className="btn-primary hidden sm:inline-flex">
            Post Property
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
