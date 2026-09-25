"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { track } from "@/lib/analytics";

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  async function onClick() {
    track("share_click", {});
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }
  return (
    <button type="button" onClick={onClick} className="btn-outline">
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
