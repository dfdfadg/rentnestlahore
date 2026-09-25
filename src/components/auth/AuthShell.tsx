import { LogoMark } from "../layout/Logo";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <LogoMark className="h-11 w-11" />
          <h1 className="mt-5 text-2xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-600">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-5 text-center text-sm text-ink-600">{footer}</div>}
      </div>
    </div>
  );
}
