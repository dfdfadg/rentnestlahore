import { BadgeCheck, FlaskConical, Star } from "lucide-react";

export function FeaturedBadge() {
  return (
    <span className="badge bg-brick-600 text-white shadow-sm">
      <Star className="h-3 w-3 fill-current" /> Featured
    </span>
  );
}

/** Only rendered when the property is verified in the database. */
export function VerifiedBadge({ label = "Verified" }: { label?: string }) {
  return (
    <span className="badge bg-emerald-600 text-white shadow-sm">
      <BadgeCheck className="h-3.5 w-3.5" /> {label}
    </span>
  );
}

/** Demo/sample records are always clearly labelled. */
export function DemoBadge() {
  return (
    <span className="badge bg-amber-300 text-amber-950 shadow-sm" title="Sample record for testing — not a real rental">
      <FlaskConical className="h-3 w-3" /> Demo Listing
    </span>
  );
}
