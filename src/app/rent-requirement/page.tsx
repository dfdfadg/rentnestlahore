import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RequirementForm } from "@/components/RequirementForm";
import { getLocations, getPropertyTypes } from "@/lib/taxonomy";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Post Your Rent Requirement – Tell Us What You Need in Lahore | RentNest Lahore",
  description:
    "Can't find the right rental? Post your requirement — area, budget and bedrooms — and we'll connect you with landlords and agents in Lahore who have matching houses, flats, portions or offices.",
  path: "/rent-requirement/",
});

export default async function RentRequirementPage() {
  const [types, locations] = await Promise.all([getPropertyTypes(), getLocations()]);
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Post a requirement", path: "/rent-requirement/" }]} />
      <div className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-extrabold">Tell us what you&apos;re looking for</h1>
        <p className="mt-3 text-lg text-ink-600">
          Kiraye ka ghar, portion, flat ya office chahiye? Share your area, budget and needs — we&apos;ll pass it to landlords and agents
          with matching rentals and get back to you.
        </p>
        <div className="mt-6">
          <RequirementForm types={types.map((t) => t.name)} areas={locations.map((l) => l.name)} />
        </div>
      </div>
    </div>
  );
}
