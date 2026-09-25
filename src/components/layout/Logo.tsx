import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#0f1d31" />
      <path d="M9 20.5 20 11l11 9.5" fill="none" stroke="#e27a4d" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 19.5V29h14v-9.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M11 26.5c3 3.4 15 3.4 18 0" fill="none" stroke="#e27a4d" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="20" cy="22.2" r="2.3" fill="#fff" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="RentNest Lahore — home">
      <LogoMark />
      <span className="leading-none">
        <span className={`block font-display text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-ink-900"}`}>
          RentNest<span className="text-brick-500">.</span>
        </span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.22em] ${light ? "text-ink-300" : "text-ink-500"}`}>
          Lahore
        </span>
      </span>
    </Link>
  );
}
