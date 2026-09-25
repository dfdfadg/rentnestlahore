"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useSession } from "../SessionProvider";
import { track } from "@/lib/analytics";

export function FavoriteButton({ propertyId, variant = "icon" }: { propertyId: string; variant?: "icon" | "button" }) {
  const { favoriteIds, toggleFavorite, loaded } = useSession();
  const router = useRouter();
  const saved = favoriteIds.has(propertyId);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleFavorite(propertyId);
    if (result === "login") {
      router.push(`/login/?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    track("favorite_toggle", { action: result });
  }

  const label = saved ? "Remove from saved rentals" : "Save this rental";

  if (variant === "button") {
    return (
      <button type="button" onClick={onClick} disabled={!loaded} className="btn-outline" aria-pressed={saved} aria-label={label}>
        <Heart className={`h-4 w-4 ${saved ? "fill-brick-600 text-brick-600" : ""}`} />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-ink-800 shadow-sm ring-1 ring-black/5 transition hover:scale-105"
    >
      <Heart className={`h-5 w-5 ${saved ? "fill-brick-600 text-brick-600" : ""}`} />
    </button>
  );
}
