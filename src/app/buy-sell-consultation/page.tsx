import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PropertyLeadForm } from "@/components/PropertyLeadForm";
import { getLocations, getPropertyTypes } from "@/lib/taxonomy";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

// RentNest's search presence stays focused on rentals, so this partner-service page is not indexed.
export const metadata: Metadata = pageMetadata({
  title: "Buy or Sell Property in Lahore: Free Consultation | RentNest Lahore",
  description: "Planning to buy or sell a property in Lahore? Share your requirement and our partner property consultant will contact you.",
  path: "/buy-sell-consultation/",
  noindex: true,
});

export default async function BuySellPage({ searchParams }: { searchParams: Promise<{ intent?: string }> }) {
  const { intent } = await searchParams;
  const [types, locations] = await Promise.all([getPropertyTypes(), getLocations()]);
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Buy / sell consultation", path: "/buy-sell-consultation/" }]} />
      <div className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-extrabold">Buying or selling a property in Lahore?</h1>
        <p className="mt-3 text-lg text-ink-600">
          RentNest Lahore lists rentals only, but if you&apos;re ready to buy or sell, our partner property consultant can help. Share a few
          details and they&apos;ll call or WhatsApp you. The consultation is free.
        </p>
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-sand-100 p-3 text-sm text-ink-700 ring-1 ring-sand-200">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brick-600" />
          Always verify ownership documents and never pay a token or advance before visiting the property and checking its papers.
        </p>
        <div className="mt-6">
          <PropertyLeadForm types={types.map((t) => t.name)} areas={locations.map((l) => l.name)} defaultIntent={intent === "sell" ? "SELL" : "BUY"} />
        </div>
      </div>
    </div>
  );
}
