"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-brick-500">Oops</p>
      <h1 className="mt-4 text-2xl font-bold">Something went wrong on our side</h1>
      <p className="mt-3 max-w-md text-ink-600">Please try again. If the problem continues, come back in a few minutes.</p>
      {error.digest && <p className="mt-2 text-xs text-ink-400">Reference: {error.digest}</p>}
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-outline">Go home</Link>
      </div>
    </div>
  );
}
