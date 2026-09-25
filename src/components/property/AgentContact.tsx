"use client";

import { useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { track } from "@/lib/analytics";

export function AgentContact({ slug }: { slug: string }) {
  const [c, setC] = useState<{ phone: string; whatsapp: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  async function get() {
    if (c) return c;
    const r = await fetch(`/api/agents/${slug}/contact/`, { cache: "no-store" });
    if (!r.ok) {
      setErr("Contact details unavailable right now.");
      return null;
    }
    const d = await r.json();
    setC(d);
    return d as { phone: string; whatsapp: string };
  }
  return (
    <div className="space-y-2">
      <button type="button" className="btn-dark w-full" onClick={async () => { const d = await get(); if (d) { track("phone_click", { source: "agent_profile" }); window.location.href = `tel:${d.phone}`; } }}>
        <Phone className="h-4 w-4" /> {c ? c.phone : "Call"}
      </button>
      <button
        type="button"
        className="btn-whatsapp w-full"
        onClick={async () => {
          const w = window.open("", "_blank");
          if (w) w.opener = null;
          const d = await get();
          if (!d) { w?.close(); return; }
          track("whatsapp_click", { source: "agent_profile" });
          const url = `https://wa.me/${d.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Hello, I found your profile on RentNest Lahore: ${window.location.href}`)}`;
          if (w) w.location.href = url; else window.location.href = url;
        }}
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
