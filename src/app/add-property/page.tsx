import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ImagePlus, ShieldCheck, UserPlus } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { QuickListingForm } from "@/components/manage/QuickListingForm";
import { WhatsAppListButton } from "@/components/WhatsAppListButton";
import { getFormOptions } from "@/lib/form-options";
import { pageMetadata } from "@/lib/seo";
import { CONTACT_WHATSAPP } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "List Your Property for Rent in Lahore for Free | RentNest Lahore",
  description:
    "Rent out your house, portion, flat, office or shop in Lahore for free. Submit details and photos in two minutes, with no account needed, and get calls from tenants.",
  path: "/add-property/",
});

export default async function AddPropertyPage() {
  const options = await getFormOptions();
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Add Property", path: "/add-property/" }]} />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold sm:text-4xl">List your property for rent for free</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-600">
            Ghar, portion, flat, office ya shop kiraye par deni hai? Details aur photos bhejein, account ki zaroorat nahi. Our team checks every
            listing, then tenants call or WhatsApp you directly.
          </p>
          <div className="mt-6">
            <QuickListingForm types={options.types} locations={options.locations} whatsapp={CONTACT_WHATSAPP} />
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {CONTACT_WHATSAPP && (
            <div className="card p-5">
              <h2 className="font-bold">Prefer WhatsApp?</h2>
              <p className="mt-1 text-sm text-ink-600">Send us the photos, rent, size and location and we&apos;ll create the listing for you.</p>
              <div className="mt-4"><WhatsAppListButton number={CONTACT_WHATSAPP} label="List via WhatsApp" className="btn-whatsapp w-full" /></div>
            </div>
          )}
          <div className="card p-5">
            <h2 className="flex items-center gap-2 font-bold"><UserPlus className="h-5 w-5 text-brick-600" /> Agents & regular landlords</h2>
            <p className="mt-1 text-sm text-ink-600">Create a free account to manage all your listings, edit photos, mark properties rented and see enquiries.</p>
            <Link href="/my-properties/new/" className="btn-outline mt-4 w-full">Post with an account</Link>
            <p className="mt-3 text-xs text-ink-500">Have many listings? Send us a spreadsheet and we can bulk-import them for you.</p>
          </div>
          <div className="card p-5">
            <h2 className="font-bold">Want to sell instead?</h2>
            <p className="mt-1 text-sm text-ink-600">RentNest lists rentals only, but our partner consultant can help you sell your property.</p>
            <Link href="/buy-sell-consultation/?intent=sell" className="btn-outline mt-4 w-full">Free selling consultation</Link>
          </div>
          <ul className="card space-y-3 p-5 text-sm text-ink-700">
            <li className="flex gap-2"><ImagePlus className="h-5 w-5 shrink-0 text-brick-600" /> Up to 8 photos. Listings with photos get far more calls.</li>
            <li className="flex gap-2"><ShieldCheck className="h-5 w-5 shrink-0 text-brick-600" /> Every listing is reviewed before going live.</li>
            <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-brick-600" /> Rental properties in Lahore only, no sale listings.</li>
          </ul>
          <div className="card p-5 text-sm">
            <h2 className="font-bold">Guides for landlords</h2>
            <ul className="mt-2 space-y-2">
              <li><Link href="/guides/how-to-rent-out-your-house-in-lahore/" className="text-brick-700 hover:underline">How to rent out your house in Lahore</Link></li>
              <li><Link href="/guides/renting-out-property-in-lahore-from-abroad/" className="text-brick-700 hover:underline">Renting out your property from abroad</Link></li>
              <li><Link href="/guides/rent-agreement-format-pakistan/" className="text-brick-700 hover:underline">Free rent agreement format</Link></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
