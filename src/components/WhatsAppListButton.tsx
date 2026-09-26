"use client";

import { MessageCircle } from "lucide-react";
import { track } from "@/lib/analytics";

/** Opens a WhatsApp chat with the RentNest team, pre-filled. */
export function WhatsAppListButton({
  number,
  label = "List on WhatsApp",
  message = "Hello RentNest Lahore, I want to list my property for rent. Details:",
  className = "btn-whatsapp",
}: {
  number: string;
  label?: string;
  message?: string;
  className?: string;
}) {
  if (!number) return null;
  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => track("whatsapp_click", { source: "list_property" })}
    >
      <MessageCircle className="h-4 w-4" /> {label}
    </a>
  );
}
