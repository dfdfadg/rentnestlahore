import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/StaticPage";
import { pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact RentNest Lahore",
  description: "Contact the RentNest Lahore team about listings, your account, partnerships or to report a problem.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <StaticPage title="Contact us" path="/contact/" intro="We're happy to help with listings, accounts and anything else about renting in Lahore.">
      <p>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      {CONTACT_PHONE && <p>Phone: <a href={`tel:${CONTACT_PHONE.replace(/[^\d+]/g, "")}`}>{CONTACT_PHONE}</a></p>}
      <h2>About a specific listing?</h2>
      <p>Please contact the landlord or agent directly using the Call, WhatsApp or enquiry buttons on the listing. To flag an inaccurate or suspicious listing, use <strong>Report this property</strong> on the listing page.</p>
      <h2>Want to list a property?</h2>
      <p>See <Link href="/add-property/">how to list your property for rent</Link>.</p>
    </StaticPage>
  );
}
