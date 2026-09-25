import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell } from "@/components/account/AccountShell";
import { PropertyCard } from "@/components/property/PropertyCard";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cardSelect } from "@/lib/properties";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Saved rentals | RentNest Lahore", robots: PRIVATE_ROBOTS };

export default async function FavoritesPage() {
  const user = await requireUser("/favorites/");
  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { property: { select: { ...cardSelect, expiresAt: true } } },
  });
  const now = new Date();
  return (
    <AccountShell user={user} active="/favorites/" title="Saved rentals">
      {favs.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-semibold">You haven&apos;t saved any rentals yet.</p>
          <p className="mt-1 text-sm text-ink-500">Tap the heart on any listing to save it here.</p>
          <Link href="/rent/" className="btn-primary mt-5">Browse rentals</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {favs.map(({ property: p }) => {
            const unavailable = p.status !== "PUBLISHED" || (p.expiresAt && p.expiresAt < now);
            return (
              <div key={p.id} className="relative">
                {unavailable && (
                  <div className="absolute inset-x-0 top-0 z-20 rounded-t-2xl bg-ink-900/90 px-3 py-1.5 text-center text-xs font-semibold text-white">
                    {p.status === "RENTED" ? "Rented — no longer available" : "No longer available"}
                  </div>
                )}
                <PropertyCard property={p} />
              </div>
            );
          })}
        </div>
      )}
    </AccountShell>
  );
}
