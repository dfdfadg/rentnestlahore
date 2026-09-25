import type { Metadata } from "next";
import { StaticPage } from "@/components/StaticPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use | RentNest Lahore",
  description: "The terms that apply when you use RentNest Lahore to search for or list rental properties in Lahore.",
  path: "/terms/",
});

export default function TermsPage() {
  return (
    <StaticPage title="Terms of use" path="/terms/">
      <p>By using RentNest Lahore you agree to these terms.</p>
      <h2>Rental listings only</h2>
      <p>RentNest Lahore is a marketplace for properties available for rent in Lahore. Listings offering property for sale are not permitted and will be removed.</p>
      <h2>Your responsibilities as a lister</h2>
      <ul>
        <li>You must be the owner of the property or authorised by the owner to rent it out.</li>
        <li>Information, rent and photos must be accurate and must not infringe anyone else&apos;s rights. Do not copy content or images from other websites.</li>
        <li>Mark the listing as rented once it is no longer available.</li>
      </ul>
      <h2>Your responsibilities as a renter</h2>
      <p>RentNest Lahore does not own or inspect the properties listed unless a listing is marked as verified. Always visit the property, verify ownership documents and agree terms in writing before paying any money.</p>
      <h2>Moderation</h2>
      <p>We may review, edit, reject or remove any listing or account that breaks these terms or that we reasonably believe is misleading, duplicated or fraudulent.</p>
      <h2>Liability</h2>
      <p>RentNest Lahore connects renters with landlords and agents and is not a party to any tenancy agreement between them.</p>
    </StaticPage>
  );
}
