"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { moderateProperty } from "@/app/actions/admin";
import { deleteProperty } from "@/app/actions/properties";

type Props = { id: string; slug: string; status: string; featured: boolean; verified: boolean };

export function AdminPropertyActions({ id, slug, status, featured, verified }: Props) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const act = (a: Parameters<typeof moderateProperty>[1], reason?: string) =>
    start(async () => {
      await moderateProperty(id, a, reason);
      router.refresh();
    });
  const btn = "rounded-lg px-2 py-1 text-xs font-semibold ring-1 disabled:opacity-50";
  return (
    <div className="flex flex-wrap gap-1" aria-busy={pending}>
      {status !== "PUBLISHED" && <button disabled={pending} onClick={() => act("approve")} className={`${btn} bg-emerald-600 text-white ring-emerald-600`}>Approve</button>}
      {status !== "REJECTED" && status !== "PUBLISHED" && (
        <button
          disabled={pending}
          onClick={() => {
            const reason = prompt("Reason for rejection (shown to the lister):", "Photos or details do not meet our listing guidelines.");
            if (reason !== null) act("reject", reason);
          }}
          className={`${btn} text-red-700 ring-red-200`}
        >
          Reject
        </button>
      )}
      {status === "PUBLISHED" && <button disabled={pending} onClick={() => act("unpublish")} className={`${btn} ring-ink-200`}>Unpublish</button>}
      {status === "PUBLISHED" && <button disabled={pending} onClick={() => act("rented")} className={`${btn} ring-ink-200`}>Rented</button>}
      <button disabled={pending} onClick={() => act(featured ? "unfeature" : "feature")} className={`${btn} ${featured ? "bg-brick-600 text-white ring-brick-600" : "ring-ink-200"}`}>{featured ? "★ Featured" : "Feature"}</button>
      <button disabled={pending} onClick={() => act(verified ? "unverify" : "verify")} className={`${btn} ${verified ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "ring-ink-200"}`}>{verified ? "✓ Verified" : "Verify"}</button>
      <Link href={`/admin/properties/${id}/edit/`} className={`${btn} ring-ink-200`}>Edit</Link>
      <Link href={`/admin/properties/${id}/photos/`} className={`${btn} ring-ink-200`}>Photos</Link>
      {status === "PUBLISHED" ? (
        <Link href={`/property/${slug}/`} className={`${btn} ring-ink-200`} target="_blank">View</Link>
      ) : (
        <Link href={`/admin/properties/${id}/preview/`} className={`${btn} ring-ink-200`}>Preview</Link>
      )}
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this listing permanently?")) start(async () => { await deleteProperty(id); router.refresh(); });
        }}
        className={`${btn} text-red-700 ring-red-200`}
      >
        Delete
      </button>
    </div>
  );
}
