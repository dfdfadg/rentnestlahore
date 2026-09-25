export default function Loading() {
  return (
    <div className="container-page py-8" aria-busy="true" aria-label="Loading rentals">
      <div className="h-4 w-48 animate-pulse rounded bg-ink-100" />
      <div className="mt-5 h-8 w-80 max-w-full animate-pulse rounded bg-ink-100" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="hidden h-[520px] animate-pulse rounded-2xl bg-ink-100 lg:block" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
              <div className="aspect-[4/3] animate-pulse bg-ink-100" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-32 animate-pulse rounded bg-ink-100" />
                <div className="h-4 w-full animate-pulse rounded bg-ink-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
