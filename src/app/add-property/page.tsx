import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ClipboardList, ImagePlus, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "List Your Property for Rent in Lahore — Free | RentNest Lahore",
  description: "Rent out your house, flat, portion, office or shop in Lahore. Create a free listing, add photos and receive enquiries directly from tenants.",
  path: "/add-property/",
});

export default function AddPropertyPage() {
  const steps = [
    { icon: ClipboardList, title: "Add the details", text: "Property type, monthly rent, size, rooms, area and amenities. We'll suggest a clear title." },
    { icon: ImagePlus, title: "Upload photos", text: "Add up to 20 photos you own. The first photo becomes the cover image." },
    { icon: ShieldCheck, title: "Quick review", text: "Our team checks every listing for accuracy and duplicates before it goes live." },
    { icon: CheckCircle2, title: "Get enquiries", text: "Tenants call, WhatsApp or send enquiries. Mark it rented when you're done." },
  ];
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Add Property", path: "/add-property/" }]} />
      <div className="mt-6 grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">List your property for rent in Lahore</h1>
          <p className="mt-4 text-lg text-ink-600">
            Reach people actively looking to rent in Lahore. Listing is free for landlords and agents, and every listing is reviewed to keep the marketplace trustworthy.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/my-properties/new/" className="btn-primary px-6">Post Property</Link>
            <Link href="/register/?next=/my-properties/new/" className="btn-outline">Create a free account</Link>
          </div>
          <p className="mt-4 text-sm text-ink-500">RentNest Lahore accepts rental listings only — no properties for sale.</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.title} className="card p-5">
              <s.icon className="h-7 w-7 text-brick-600" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Step {i + 1}</p>
              <h2 className="text-lg font-bold">{s.title}</h2>
              <p className="mt-1 text-sm text-ink-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
      <section className="mt-14 max-w-3xl">
        <h2 className="text-xl font-bold">Listing guidelines</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-6 text-[15px] text-ink-700">
          <li>Only list properties that are genuinely available for rent in Lahore and that you are authorised to rent out.</li>
          <li>Use your own photos, or photos you have permission to use. Don&apos;t copy images or text from other websites.</li>
          <li>Show the real monthly rent. Mention the security deposit and advance if you know them.</li>
          <li>One listing per property. Duplicate listings are removed.</li>
          <li>Mark your listing as rented as soon as it is taken so tenants aren&apos;t disappointed.</li>
        </ul>
      </section>
    </div>
  );
}
