import { Breadcrumbs } from "./ui/Breadcrumbs";

export function StaticPage({ title, path, children, intro }: { title: string; path: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: title, path }]} />
      <article className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-extrabold">{title}</h1>
        {intro && <p className="mt-3 text-lg text-ink-600">{intro}</p>}
        <div className="prose-rn mt-6">{children}</div>
      </article>
    </div>
  );
}
