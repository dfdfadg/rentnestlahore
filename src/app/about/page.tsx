import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/StaticPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About RentNest Lahore — A Rent-Only Marketplace",
  description: "RentNest Lahore is a rent-only property marketplace for Lahore: houses, flats, portions, rooms, offices, shops and warehouses for rent.",
  path: "/about/",
});

export default function AboutPage() {
  return (
    <StaticPage title="About RentNest Lahore" path="/about/" intro="One city. One purpose. Helping people find a place to rent in Lahore.">
      <p>RentNest Lahore is a property marketplace dedicated entirely to rentals in Lahore. We don&apos;t list properties for sale — every search, filter and page is built around finding a home or workspace to rent.</p>
      <h2>What we believe</h2>
      <ul>
        <li><strong>Clarity:</strong> monthly rent, size and location up front on every listing.</li>
        <li><strong>Trust:</strong> listings are reviewed before they go live, verified badges only appear when we have actually verified something, and anyone can report a problem.</li>
        <li><strong>Local focus:</strong> areas, phases and blocks organised the way Lahore renters search.</li>
      </ul>
      <h2>For landlords and agents</h2>
      <p>You can <Link href="/add-property/">list a property for rent</Link> free of charge. Tenants contact you directly by phone, WhatsApp or enquiry form.</p>
      <p>Questions? <Link href="/contact/">Get in touch</Link>.</p>
    </StaticPage>
  );
}
