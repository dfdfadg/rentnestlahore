import Link from "next/link";
import { Logo } from "./Logo";
import { CONTACT_EMAIL, CONTACT_PHONE, SITE_TAGLINE } from "@/lib/site";

const COLUMNS = [
  {
    title: "Residential rentals",
    links: [
      { href: "/rent/houses/", label: "Houses for rent" },
      { href: "/rent/flats/", label: "Flats for rent" },
      { href: "/rent/apartments/", label: "Apartments for rent" },
      { href: "/rent/portions/", label: "Portions for rent" },
      { href: "/rent/rooms/", label: "Rooms for rent" },
    ],
  },
  {
    title: "Commercial rentals",
    links: [
      { href: "/rent/offices/", label: "Offices for rent" },
      { href: "/rent/shops/", label: "Shops for rent" },
      { href: "/rent/warehouses/", label: "Warehouses for rent" },
      { href: "/rent/commercial-properties/", label: "All commercial" },
    ],
  },
  {
    title: "Popular areas",
    links: [
      { href: "/rent/dha-lahore/", label: "DHA Lahore" },
      { href: "/rent/gulberg/", label: "Gulberg" },
      { href: "/rent/johar-town/", label: "Johar Town" },
      { href: "/rent/bahria-town/", label: "Bahria Town" },
      { href: "/rent/model-town/", label: "Model Town" },
      { href: "/areas/", label: "All Lahore areas" },
    ],
  },
  {
    title: "RentNest",
    links: [
      { href: "/about/", label: "About us" },
      { href: "/guides/", label: "Rental guides" },
      { href: "/agents/", label: "Agents & landlords" },
      { href: "/add-property/", label: "List your property" },
      { href: "/contact/", label: "Contact" },
      { href: "/privacy/", label: "Privacy policy" },
      { href: "/terms/", label: "Terms of use" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-ink-900 text-ink-200">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-6 text-ink-300">
            {SITE_TAGLINE}. A rent-only marketplace for houses, flats, offices, shops and more — exclusively in Lahore.
          </p>
          <p className="mt-4 text-sm">
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-white hover:underline">{CONTACT_EMAIL}</a>
            {CONTACT_PHONE && (
              <>
                <br />
                <a href={`tel:${CONTACT_PHONE.replace(/[^\d+]/g, "")}`} className="text-white hover:underline">{CONTACT_PHONE}</a>
              </>
            )}
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-semibold text-white">{col.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ink-300 hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-800">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-ink-400 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} RentNest Lahore. All rights reserved.</p>
          <p>Rental listings only · Lahore, Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
