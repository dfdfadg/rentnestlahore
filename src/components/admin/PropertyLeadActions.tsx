"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, MessageCircle } from "lucide-react";
import { setPropertyLeadStatus } from "@/app/actions/property-leads";

export function PropertyLeadActions({ id, status, text, partner }: { id: string; status: string; text: string; partner: string }) {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const mark = (s: "NEW" | "FORWARDED" | "CONVERTED" | "CLOSED" | "SPAM") => start(async () => { await setPropertyLeadStatus(id, s); router.refresh(); });
  return (
    <div className="flex flex-wrap items-center gap-2">
      {partner && (
        <a
          href={`https://wa.me/${partner}?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { if (status === "NEW") mark("FORWARDED"); }}
          className="btn-whatsapp min-h-9 px-3 py-1 text-xs"
        >
          <MessageCircle className="h-3.5 w-3.5" /> Forward to partner
        </a>
      )}
      <button
        type="button"
        className="btn-outline min-h-9 px-3 py-1 text-xs"
        onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      >
        <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy lead"}
      </button>
      <select aria-label="Lead status" value={status} disabled={pending} onChange={(e) => mark(e.target.value as "NEW")} className="input min-h-9 w-auto py-1 text-xs">
        {["NEW", "FORWARDED", "CONVERTED", "CLOSED", "SPAM"].map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
      </select>
    </div>
  );
}
