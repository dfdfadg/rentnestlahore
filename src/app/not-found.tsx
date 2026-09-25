import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="font-display text-7xl font-extrabold text-brick-500">404</p>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-md text-ink-600">
        The page may have moved, or the rental may no longer be listed. Try searching current rentals in Lahore instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/rent/" className="btn-primary">Browse rentals</Link>
        <Link href="/areas/" className="btn-outline">Explore areas</Link>
        <Link href="/" className="btn-ghost">Go home</Link>
      </div>
    </div>
  );
}
