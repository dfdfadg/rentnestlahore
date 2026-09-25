"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProperty, markRented, submitForReview } from "@/app/actions/properties";

export function ListingActions({ id, status, slug, base = "/my-properties" }: { id: string; status: string; slug: string; base?: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const run = (fn: () => Promise<{ ok?: boolean; message?: string } | undefined>, confirmText?: string) => {
    if (confirmText && !confirm(confirmText)) return;
    start(async () => {
      const r = await fn();
      setMsg(r?.message ?? null);
      router.refresh();
    });
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-sm">
      <Link href={`${base}/${id}/edit/`} className="btn-outline min-h-9 px-3 py-1">Edit</Link>
      <Link href={`${base}/${id}/photos/`} className="btn-outline min-h-9 px-3 py-1">Photos</Link>
      {status === "PUBLISHED" && <Link href={`/property/${slug}/`} className="btn-ghost min-h-9 px-3 py-1">View</Link>}
      {["DRAFT", "REJECTED", "EXPIRED"].includes(status) && (
        <button type="button" disabled={pending} onClick={() => run(() => submitForReview(id))} className="btn-dark min-h-9 px-3 py-1">Submit for review</button>
      )}
      {status === "PUBLISHED" && (
        <button type="button" disabled={pending} onClick={() => run(() => markRented(id), "Mark this property as rented? It will be removed from search.")} className="btn-ghost min-h-9 px-3 py-1">Mark rented</button>
      )}
      <button type="button" disabled={pending} onClick={() => run(() => deleteProperty(id), "Delete this listing permanently?")} className="btn-ghost min-h-9 px-3 py-1 text-red-600">Delete</button>
      {msg && <p className="w-full text-xs text-ink-600" role="status">{msg}</p>}
    </div>
  );
}

export function SubmitForReviewButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok?: boolean; message?: string } | null>(null);
  const router = useRouter();
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        className="btn-primary"
        onClick={() =>
          start(async () => {
            const r = await submitForReview(id);
            setMsg(r ?? null);
            router.refresh();
          })
        }
      >
        {pending ? "Submitting…" : "Submit for review"}
      </button>
      {msg?.message && <p className={`mt-2 text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`} role="status">{msg.message}</p>}
    </div>
  );
}
