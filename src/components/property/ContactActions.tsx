"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { track } from "@/lib/analytics";

type Contact = { phone: string; whatsapp: string };

function waNumber(n: string) {
  return n.replace(/[^\d]/g, "");
}

function formatPhone(n: string) {
  const d = n.replace(/[^\d]/g, "");
  if (d.startsWith("92") && d.length === 12) return `+92 ${d.slice(2, 5)} ${d.slice(5)}`;
  return n;
}

async function fetchContact(propertyId: string): Promise<Contact | null> {
  const res = await fetch(`/api/properties/${propertyId}/contact/`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

/** Call + WhatsApp buttons. Numbers are fetched on click rather than embedded in the page. */
export function ContactActions({ propertyId, propertyUrl, layout = "stack" }: { propertyId: string; propertyUrl: string; layout?: "stack" | "bar" }) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ensure(): Promise<Contact | null> {
    if (contact) return contact;
    const c = await fetchContact(propertyId);
    if (!c) setError("Contact details are not available right now.");
    setContact(c);
    return c;
  }

  async function onCall() {
    const c = await ensure();
    if (!c) return;
    track("phone_click", { property_id: propertyId });
    window.location.href = `tel:${c.phone}`;
  }

  async function onWhatsApp() {
    // Open synchronously to avoid popup blockers, then point it at wa.me.
    const win = window.open("", "_blank");
    if (win) win.opener = null;
    const c = await ensure();
    if (!c) {
      win?.close();
      return;
    }
    track("whatsapp_click", { property_id: propertyId });
    const text = encodeURIComponent(`Hello, I am interested in this rental property on RentNest Lahore: ${propertyUrl}`);
    const url = `https://wa.me/${waNumber(c.whatsapp)}?text=${text}`;
    if (win) win.location.href = url;
    else window.location.href = url;
  }

  if (layout === "bar") {
    return (
      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={onCall} className="btn-dark px-2"><Phone className="h-4 w-4" /> Call</button>
        <button type="button" onClick={onWhatsApp} className="btn-whatsapp px-2"><MessageCircle className="h-4 w-4" /> WhatsApp</button>
        <a href="#enquiry" className="btn-primary px-2">Enquire</a>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={onCall} className="btn-dark w-full">
        <Phone className="h-4 w-4" /> {contact ? formatPhone(contact.phone) : "Call"}
      </button>
      <button type="button" onClick={onWhatsApp} className="btn-whatsapp w-full">
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </button>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}

export function ViewTracker({ propertyId, type, area }: { propertyId: string; type: string; area: string }) {
  useEffect(() => {
    track("property_view", { property_id: propertyId, property_type: type, area });
    fetch(`/api/properties/${propertyId}/view/`, { method: "POST", keepalive: true }).catch(() => {});
  }, [propertyId, type, area]);
  return null;
}
