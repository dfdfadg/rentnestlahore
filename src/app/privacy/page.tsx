import type { Metadata } from "next";
import { StaticPage } from "@/components/StaticPage";
import { pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy | RentNest Lahore",
  description: "How RentNest Lahore collects, uses and protects personal information.",
  path: "/privacy/",
});

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy policy" path="/privacy/">
      <p>This policy explains what information RentNest Lahore collects and how it is used.</p>
      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account details:</strong> name, email, optional phone number and a securely hashed password.</li>
        <li><strong>Listings:</strong> property details, photos and the contact numbers you choose to show to renters.</li>
        <li><strong>Enquiries:</strong> the name, phone, optional email and message you send to a landlord or agent.</li>
        <li><strong>Usage:</strong> if analytics are enabled, aggregated information about pages viewed and features used. We do not send names, phone numbers or emails to analytics tools.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To run the marketplace: show listings, deliver enquiries to the right landlord or agent, and let you save rentals.</li>
        <li>To keep the platform safe: moderation, spam prevention and investigating reports.</li>
        <li>To send essential emails such as password resets.</li>
      </ul>
      <h2>Sharing</h2>
      <p>Enquiry details are shared only with the landlord or agent of the listing you contact. We do not sell personal information.</p>
      <h2>Location privacy</h2>
      <p>Listing maps show an approximate area only; exact addresses are not published.</p>
      <h2>Your choices</h2>
      <p>You can edit your profile and listings at any time, and delete your listings. To delete your account, contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </StaticPage>
  );
}
