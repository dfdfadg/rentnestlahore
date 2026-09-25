/**
 * Original RentNest Lahore rental guides.
 * Inline syntax supported in text: [link text](/path/) and **bold**.
 * General information only — not legal advice.
 */
export type GuideBlock =
  | { h2: string }
  | { h3: string }
  | { p: string }
  | { ul: string[] }
  | { ol: string[] }
  | { stats: "lahore-types" | "house-areas" }
  | { note: string };

export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: "Renting basics" | "Area guides" | "Costs" | "Legal & documents";
  updated: string; // ISO date
  readMinutes: number;
  /** Related listing links shown at the end of the guide. */
  related: { href: string; label: string }[];
  body: GuideBlock[];
};

const LEGAL_NOTE =
  "This guide is general information, not legal advice. Laws and procedures can change — for a specific situation, speak to a qualified lawyer or the relevant office.";

export const GUIDES: Guide[] = [
  {
    slug: "how-to-find-a-house-for-rent-in-lahore",
    title: "How to Find a House for Rent in Lahore",
    description: "A step-by-step approach to finding a rental house in Lahore: setting a budget, choosing an area, shortlisting, visiting and finalising the deal.",
    category: "Renting basics",
    updated: "2026-09-20",
    readMinutes: 7,
    related: [
      { href: "/rent/houses/", label: "Houses for rent in Lahore" },
      { href: "/rent/portions/", label: "Portions for rent in Lahore" },
      { href: "/areas/", label: "Browse Lahore areas" },
    ],
    body: [
      { p: "Lahore's rental market is large and varied — from compact 5 Marla homes in established neighbourhoods to 1 Kanal and 2 Kanal houses in DHA and Bahria Town. A little structure at the start saves weeks of back-and-forth. Here is the process we recommend." },
      { h2: "1. Work out your real monthly budget" },
      { p: "Start with the monthly rent you can comfortably pay, then add the costs that come with it. Most landlords ask for a **security deposit** (commonly one to three months' rent) and **advance rent** for one or more months. If an agent is involved there is usually a commission. Utilities — electricity, gas, water and sometimes society maintenance — are normally paid by the tenant on top of rent." },
      { ul: ["Monthly rent", "Security deposit (refundable, subject to the agreement)", "Advance rent", "Agent commission, if any", "Utilities and maintenance charges", "Moving costs and any immediate repairs"] },
      { h2: "2. Choose two or three target areas" },
      { p: "Commute time matters more than almost anything else in Lahore traffic. Shortlist areas close to work, schools or family, then compare them. Our [area directory](/areas/) shows how many active rentals each area has, and each area page includes a live rent snapshot calculated from current listings." },
      { h2: "3. Decide on size and type" },
      { p: "Sizes are usually quoted in Marla and Kanal. A 5 Marla house typically suits a small family, 10 Marla gives more bedrooms and parking, and 1 Kanal homes add lawns and servant quarters. If you don't need an entire house, an [upper or lower portion](/rent/portions/) can offer the same neighbourhood at a noticeably lower rent." },
      { h2: "4. Shortlist and compare listings" },
      { p: "Use filters for monthly rent, bedrooms, size and furnishing, then save the listings you like with the heart icon so you can compare them side by side later. Look at the posted date — older listings may already be rented, so confirm availability first." },
      { h2: "5. Visit in person" },
      { p: "Always visit before paying anything. Check water pressure, signs of seepage, the condition of wiring and fittings, and whether electricity and gas meters are separate. Visit at different times of day if you can to judge traffic, noise and load-shedding. Our checklist [What to Check Before Renting a House](/guides/what-to-check-before-renting-a-house/) covers this in detail." },
      { h2: "6. Agree terms in writing" },
      { p: "Once you have agreed rent, deposit, advance and the start date, put everything into a written tenancy agreement signed by both parties. See our [Rental Agreement Checklist](/guides/rental-agreement-checklist-in-pakistan/) for the clauses to look for and the [documents you'll need](/guides/documents-needed-to-rent-a-house/)." },
      { h2: "Red flags to watch for" },
      { ul: ["Pressure to pay a deposit before you have seen the property", "A rent far below similar homes in the same area", "Refusal to show ownership documents or sign a written agreement", "Requests to pay into a personal account of someone who is not the owner or an authorised agent"] },
      { p: "If a listing on RentNest Lahore looks suspicious, use the **Report property** button on the listing page and our team will review it." },
    ],
  },
  {
    slug: "cost-of-renting-a-house-in-lahore",
    title: "How Much Does It Cost to Rent a House in Lahore?",
    description: "What drives rents in Lahore, the upfront costs to budget for, and a live snapshot of asking rents by property type and area from current listings.",
    category: "Costs",
    updated: "2026-09-20",
    readMinutes: 6,
    related: [
      { href: "/rent/houses/", label: "Houses for rent" },
      { href: "/rent/flats/", label: "Flats for rent" },
      { href: "/rent/", label: "All rentals in Lahore" },
    ],
    body: [
      { p: "There is no single answer — rent in Lahore depends on the area, the size of the property, its condition and whether it's furnished. Rather than quoting figures that go out of date, the tables below are calculated live from active listings on RentNest Lahore." },
      { h2: "Live asking rents by property type" },
      { stats: "lahore-types" },
      { h2: "Houses: typical asking rent by area" },
      { stats: "house-areas" },
      { note: "These are asking rents from listings currently active on RentNest Lahore, not completed deals. While the platform is in its early stages, sample (demo) listings may be included." },
      { h2: "What pushes rent up or down" },
      { ul: ["**Area and phase** — central and well-managed societies command higher rents.", "**Size** — measured in Marla, Kanal or square feet.", "**Condition** — brand-new and renovated homes rent for more.", "**Furnishing** — furnished homes and apartments carry a premium.", "**Extras** — backup power, security, parking, lawns and servant quarters.", "**Road and position** — main-road and corner properties matter especially for commercial rentals."] },
      { h2: "Upfront costs to budget for" },
      { p: "In addition to the first month's rent, most tenants pay a refundable security deposit and advance rent. The exact amounts are agreed with the landlord and written into the tenancy agreement. If you use an agent, confirm their commission before you view properties." },
      { h2: "Ongoing costs" },
      { p: "Electricity, gas and water bills are usually paid by the tenant. Some societies also charge monthly maintenance or security fees — ask who pays these before you sign." },
    ],
  },
  {
    slug: "best-areas-to-rent-a-house-in-lahore",
    title: "Best Areas to Rent a House in Lahore",
    description: "An overview of Lahore's most popular rental areas — who each one suits, what kind of homes you'll find and how to choose between them.",
    category: "Area guides",
    updated: "2026-09-20",
    readMinutes: 7,
    related: [
      { href: "/areas/", label: "All Lahore areas" },
      { href: "/rent/houses/", label: "Houses for rent in Lahore" },
    ],
    body: [
      { p: "The \"best\" area is the one that fits your commute, budget and lifestyle. Below is a practical overview of the areas renters ask about most. Each links to live listings and an area page with a current rent snapshot." },
      { h2: "DHA Lahore" },
      { p: "Planned phases with wide roads, parks and managed security. Strong supply of 5 Marla to 2 Kanal houses, plus apartments and commercial space. Rents vary significantly by phase. [Rentals in DHA Lahore](/rent/dha-lahore/) · [DHA rental guide](/guides/dha-lahore-rental-guide/)" },
      { h2: "Gulberg" },
      { p: "Central Lahore's commercial heart — ideal if you work nearby. Plenty of apartments and offices, with larger older houses on residential streets. [Rentals in Gulberg](/rent/gulberg/) · [Gulberg rental guide](/guides/gulberg-lahore-rental-guide/)" },
      { h2: "Johar Town" },
      { p: "Well connected, with a wide spread of houses, portions, flats and rooms at mid-range rents; popular with students and families. [Rentals in Johar Town](/rent/johar-town/) · [Johar Town rental guide](/guides/johar-town-rental-guide/)" },
      { h2: "Bahria Town Lahore" },
      { p: "A self-contained gated community with its own schools, hospital and markets — good for families who value facilities and security. [Rentals in Bahria Town](/rent/bahria-town/) · [Bahria Town rental guide](/guides/bahria-town-lahore-rental-guide/)" },
      { h2: "Model Town, Garden Town and Faisal Town" },
      { p: "Established central neighbourhoods with mature trees and spacious family homes and portions. [Model Town](/rent/model-town/) · [Garden Town](/rent/garden-town/) · [Faisal Town](/rent/faisal-town/)" },
      { h2: "Wapda Town, PIA Housing Society and Jubilee Town" },
      { p: "Family-oriented societies near Johar Town with houses and portions at comparatively moderate rents. [Wapda Town](/rent/wapda-town/) · [PIA Housing Society](/rent/pia-housing-society/) · [Jubilee Town](/rent/jubilee-town/)" },
      { h2: "Raiwind Road societies" },
      { p: "Lake City, Valencia Town, LDA Avenue, Bahria Orchard and Fazaia Housing Scheme offer newer construction and gated living, usually at lower rents than central Lahore — with a longer commute. [Lake City](/rent/lake-city/) · [Valencia Town](/rent/valencia-town/) · [Bahria Orchard](/rent/bahria-orchard/)" },
      { h2: "How to choose" },
      { ol: ["Map your daily commute at peak hours.", "Compare the live rent snapshot on each area page.", "Visit the area in the evening as well as the daytime.", "Ask neighbours about water supply, load-shedding and security."] },
    ],
  },
  {
    slug: "dha-lahore-rental-guide",
    title: "DHA Lahore Rental Guide",
    description: "Renting in DHA Lahore: how the phases differ, the types of homes available, costs to plan for and practical tips before you sign.",
    category: "Area guides",
    updated: "2026-09-20",
    readMinutes: 5,
    related: [
      { href: "/rent/dha-lahore/", label: "All rentals in DHA Lahore" },
      { href: "/rent/dha-lahore/houses/", label: "Houses for rent in DHA Lahore" },
      { href: "/rent/dha-lahore/offices/", label: "Offices for rent in DHA Lahore" },
    ],
    body: [
      { p: "DHA Lahore (Defence Housing Authority) is made up of numbered phases in the east and south-east of the city. It's one of the most requested rental areas in Lahore thanks to its planned layout, parks, commercial areas and managed security." },
      { h2: "Phases at a glance" },
      { p: "Older phases closer to Lahore Cantt are fully developed with mature trees and established markets. Newer phases further east tend to have more recently built homes. Rents can differ noticeably from one phase to the next, so compare like with like — the same size house in a different phase can have a very different rent." },
      { h2: "What you can rent" },
      { ul: ["5 and 10 Marla houses — popular with smaller families", "1 Kanal and 2 Kanal homes with lawns and servant quarters", "Upper and lower portions of larger homes", "Apartments in managed buildings", "Offices, shops and showrooms in commercial blocks"] },
      { h2: "Tips for renting in DHA" },
      { ul: ["Ask whether society maintenance charges are included in the rent.", "Confirm the tenant registration process with the landlord — you will need copies of your CNIC.", "Check backup power arrangements and water tank capacity.", "For portions, confirm separate meters and entrance."] },
      { p: "See the live rent snapshot on the [DHA Lahore rentals page](/rent/dha-lahore/) to compare current asking rents by property type." },
    ],
  },
  {
    slug: "bahria-town-lahore-rental-guide",
    title: "Bahria Town Lahore Rental Guide",
    description: "What to expect when renting in Bahria Town Lahore — homes available, facilities, commute considerations and questions to ask.",
    category: "Area guides",
    updated: "2026-09-20",
    readMinutes: 4,
    related: [
      { href: "/rent/bahria-town/", label: "All rentals in Bahria Town" },
      { href: "/rent/bahria-town/houses/", label: "Houses for rent in Bahria Town" },
      { href: "/rent/bahria-orchard/", label: "Rentals in Bahria Orchard" },
    ],
    body: [
      { p: "Bahria Town Lahore is a gated private society in the south-west of the city with its own commercial areas, schools, hospital, mosques and parks. Many families choose it for its facilities and controlled access." },
      { h2: "Types of rentals" },
      { ul: ["Apartments above commercial blocks — a budget-friendly way into the society", "5, 8 and 10 Marla houses", "1 Kanal homes in established sectors", "Shops and offices in commercial areas"] },
      { h2: "Things to consider" },
      { ul: ["**Commute:** Bahria Town is some distance from central Lahore — test your route at peak times.", "**Maintenance charges:** ask whether society charges are paid by the tenant or landlord.", "**Utilities:** confirm how electricity and water are billed in the specific sector.", "**Access passes:** ask how residents' vehicle stickers or passes are issued for tenants."] },
      { p: "Nearby, [Bahria Orchard](/rent/bahria-orchard/) often offers lower rents for similar gated living." },
    ],
  },
  {
    slug: "johar-town-rental-guide",
    title: "Johar Town Rental Guide",
    description: "Renting in Johar Town, Lahore: who it suits, what you'll find — from rooms to houses and offices — and tips for tenants.",
    category: "Area guides",
    updated: "2026-09-20",
    readMinutes: 4,
    related: [
      { href: "/rent/johar-town/", label: "All rentals in Johar Town" },
      { href: "/rent/johar-town/houses/", label: "Houses for rent in Johar Town" },
      { href: "/rent/rooms/", label: "Rooms for rent in Lahore" },
    ],
    body: [
      { p: "Johar Town is one of Lahore's largest and best-connected residential and commercial areas, near the Expo Centre, Emporium Mall, universities and hospitals. It has one of the widest ranges of rental stock in the city." },
      { h2: "Who it suits" },
      { ul: ["**Students** — rooms and shared flats near universities", "**Young professionals** — flats and portions close to offices", "**Families** — houses and portions in residential blocks", "**Businesses** — offices and shops on main boulevards"] },
      { h2: "Tips" },
      { ul: ["Blocks differ in character — some are quiet residential streets, others are busy commercial strips.", "For rooms, confirm what's included: utilities, internet, kitchen access and visitors policy.", "Nearby [PIA Housing Society](/rent/pia-housing-society/) and [Wapda Town](/rent/wapda-town/) are worth comparing."] },
    ],
  },
  {
    slug: "gulberg-lahore-rental-guide",
    title: "Gulberg Lahore Rental Guide",
    description: "Renting homes, apartments and offices in Gulberg — central Lahore's business and lifestyle district.",
    category: "Area guides",
    updated: "2026-09-20",
    readMinutes: 4,
    related: [
      { href: "/rent/gulberg/", label: "All rentals in Gulberg" },
      { href: "/rent/gulberg/offices/", label: "Offices for rent in Gulberg" },
      { href: "/rent/apartments/", label: "Apartments for rent in Lahore" },
    ],
    body: [
      { p: "Gulberg is central Lahore's business and lifestyle district, home to MM Alam Road, Main Boulevard and Liberty Market. It's a natural choice if you work in the area or run a customer-facing business." },
      { h2: "Residential rentals" },
      { p: "Apartments and penthouses in modern buildings sit alongside larger, older houses on quieter residential streets. Furnished apartments are common and suit professionals relocating to Lahore." },
      { h2: "Commercial rentals" },
      { p: "Gulberg has a deep supply of offices — from small furnished units to entire floors — and retail space on its main roads. For offices, check parking allocation, backup power and after-hours access. For shops, frontage and footfall matter as much as the rent." },
      { h2: "Tips" },
      { ul: ["Traffic around main roads is heavy at peak hours — factor it into your plans.", "Ask about building maintenance charges for apartments and offices.", "Compare with [Lahore Cantt](/rent/cantt/) and [Garden Town](/rent/garden-town/) for nearby alternatives."] },
    ],
  },
  {
    slug: "what-to-check-before-renting-a-house",
    title: "What to Check Before Renting a House",
    description: "A practical inspection checklist for viewing a rental house in Lahore — structure, utilities, security and the paperwork to confirm.",
    category: "Renting basics",
    updated: "2026-09-20",
    readMinutes: 5,
    related: [
      { href: "/guides/questions-to-ask-before-renting-a-property/", label: "Questions to ask before renting" },
      { href: "/rent/houses/", label: "Houses for rent in Lahore" },
    ],
    body: [
      { p: "A careful viewing prevents most disputes later. Take photos during your visit and note anything that needs fixing before you move in — then get the landlord to agree to those repairs in writing." },
      { h2: "Structure and finishes" },
      { ul: ["Damp patches or seepage on walls and ceilings (check under stairs and around bathrooms)", "Cracks in walls, loose tiles and the condition of the roof", "Doors, windows and locks — do they close and lock properly?", "Kitchen cabinets, wardrobes and fittings that are part of the rental"] },
      { h2: "Utilities" },
      { ul: ["Separate electricity and gas meters (especially for portions)", "Recent utility bills — are they paid up to date?", "Water pressure on upper floors and water tank capacity", "Wiring condition, earthing and the number of sockets", "Backup power: UPS or generator provisions, and any solar setup"] },
      { h2: "Security and surroundings" },
      { ul: ["Boundary walls, gate and street lighting", "Parking for your vehicles", "Noise from main roads, markets or schools", "Distance to your work, schools and a hospital"] },
      { h2: "Paperwork to confirm" },
      { ul: ["The person renting to you is the owner, or has written authority from the owner", "Any society requirements for tenants", "The exact rent, deposit, advance and start date — all in a written agreement"] },
    ],
  },
  {
    slug: "rental-agreement-checklist-in-pakistan",
    title: "Rental Agreement Checklist in Pakistan",
    description: "The clauses every residential tenancy agreement in Lahore should cover, plus registration steps for landlords and tenants in Punjab.",
    category: "Legal & documents",
    updated: "2026-09-20",
    readMinutes: 6,
    related: [
      { href: "/guides/documents-needed-to-rent-a-house/", label: "Documents needed to rent a house" },
      { href: "/guides/what-to-check-before-renting-a-house/", label: "What to check before renting" },
    ],
    body: [
      { p: "A clear written agreement protects both landlord and tenant. In Punjab, the **Punjab Rented Premises Act, 2009** requires tenancy agreements to be in writing, and a copy of the agreement is to be provided to the Rent Registrar. Agreements are typically written on stamp paper and signed in front of witnesses." },
      { h2: "Clauses to include" },
      { ol: [
        "**Parties** — full names, CNIC numbers and addresses of landlord and tenant.",
        "**Property** — complete address and a description, including any furniture or fittings provided.",
        "**Term** — start date and the length of the tenancy (for example 11 months or 1 year), and how it can be renewed.",
        "**Rent** — the monthly amount, due date and payment method (bank transfer gives both sides a record).",
        "**Rent increase** — whether rent increases on renewal and by how much.",
        "**Security deposit** — amount, and the conditions and timeline for returning it.",
        "**Advance rent** — how many months are paid in advance and how they are adjusted.",
        "**Utilities and charges** — who pays electricity, gas, water and society maintenance.",
        "**Repairs** — who handles routine maintenance versus major structural repairs.",
        "**Use** — residential use only, number of occupants, and whether subletting is allowed.",
        "**Notice period** — how much notice either side must give to end the tenancy.",
        "**Handover** — condition of the property at move-in and move-out (attach photos or an inventory).",
      ] },
      { h2: "Registration with the police" },
      { p: "Under the **Punjab Information of Temporary Residents Act, 2015**, landlords are required to provide information about their tenants to the local police. This is usually done at the local police station or a police facilitation centre using the tenant's CNIC copies and photographs. Tenants should co-operate and keep a copy of the registration." },
      { h2: "Before you sign" },
      { ul: ["Read every clause — don't sign a blank or partly filled agreement.", "Make sure the person signing as landlord is the owner or holds written authority.", "Keep signed copies, payment receipts and move-in photos safely."] },
      { note: LEGAL_NOTE },
    ],
  },
  {
    slug: "documents-needed-to-rent-a-house",
    title: "Documents Needed to Rent a House in Lahore",
    description: "The documents tenants and landlords typically exchange when renting a house or portion in Lahore.",
    category: "Legal & documents",
    updated: "2026-09-20",
    readMinutes: 3,
    related: [
      { href: "/guides/rental-agreement-checklist-in-pakistan/", label: "Rental agreement checklist" },
      { href: "/rent/", label: "Browse rentals in Lahore" },
    ],
    body: [
      { p: "Having your documents ready speeds up the process and shows the landlord you're a serious tenant." },
      { h2: "Documents tenants usually provide" },
      { ul: ["Copies of CNIC for the main tenant (and often for adult family members)", "Recent passport-size photographs", "Contact details and a reference, such as an employer or previous landlord", "For companies renting offices: company registration documents and an authorisation letter"] },
      { h2: "Documents to ask the landlord for" },
      { ul: ["Copy of the owner's CNIC", "Proof of ownership (for example, the title or allotment document) or written authority if an agent or relative is renting on the owner's behalf", "Recent paid utility bills", "Any society permission or NOC required for tenants"] },
      { h2: "After signing" },
      { ul: ["Signed tenancy agreement on stamp paper", "Receipts for the deposit, advance and rent", "Police tenant registration confirmation"] },
      { note: LEGAL_NOTE },
    ],
  },
  {
    slug: "questions-to-ask-before-renting-a-property",
    title: "Questions to Ask Before Renting a Property",
    description: "The questions to ask a landlord or agent before you commit to a rental in Lahore — covering money, utilities, rules and repairs.",
    category: "Renting basics",
    updated: "2026-09-20",
    readMinutes: 4,
    related: [
      { href: "/guides/what-to-check-before-renting-a-house/", label: "What to check before renting" },
      { href: "/rent/", label: "Browse rentals in Lahore" },
    ],
    body: [
      { p: "Asking the right questions up front avoids surprises after you move in. Keep the answers in writing — a WhatsApp message is better than nothing, and the agreement is best." },
      { h2: "Money" },
      { ul: ["What is the monthly rent, and when is it due?", "How much is the security deposit, and when will it be returned?", "How many months of advance rent are required?", "Is there an agent commission, and who pays it?", "Will the rent increase at renewal? By how much?"] },
      { h2: "Utilities and running costs" },
      { ul: ["Are electricity and gas meters separate?", "Are there outstanding bills?", "Who pays society maintenance or security charges?", "Is there backup power, and who maintains it?"] },
      { h2: "Rules and repairs" },
      { ul: ["Who handles repairs, and how quickly?", "Are pets, guests or home businesses allowed?", "Can I make small changes such as painting or fitting an AC?", "What notice is needed to leave?"] },
      { h2: "Availability" },
      { ul: ["When can I move in?", "Is anyone else considering the property?", "Can I see the ownership documents before paying?"] },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
