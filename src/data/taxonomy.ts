/**
 * Initial taxonomy used by the database seed. After seeding, everything here is
 * editable from the admin panel — nothing in the app depends on these literals
 * except the landing-page groups in src/lib/taxonomy.ts.
 *
 * Coordinates are approximate area centroids, used only for approximate maps
 * and "nearby areas" suggestions.
 */
import type { PropertyCategory } from "@prisma/client";

export type SeedPropertyType = {
  name: string;
  slug: string;
  pluralName: string;
  pluralSlug: string;
  category: PropertyCategory;
  description: string;
};

export const PROPERTY_TYPES: SeedPropertyType[] = [
  {
    name: "House", slug: "house", pluralName: "Houses", pluralSlug: "houses", category: "RESIDENTIAL",
    description:
      "Houses are the most searched rental category in Lahore. Sizes are usually quoted in Marla or Kanal — 5 and 10 Marla homes suit smaller families, while 1 Kanal and larger homes offer extra bedrooms, lawns and servant quarters. Compare monthly rent, security deposit and advance terms before shortlisting.",
  },
  {
    name: "Flat", slug: "flat", pluralName: "Flats", pluralSlug: "flats", category: "RESIDENTIAL",
    description:
      "Flats offer an affordable way to rent in central Lahore, often above commercial markets or in low-rise blocks. They are popular with students, young professionals and small families who want to be close to work, universities and main roads.",
  },
  {
    name: "Apartment", slug: "apartment", pluralName: "Apartments", pluralSlug: "apartments", category: "RESIDENTIAL",
    description:
      "Apartments in Lahore are typically in managed buildings with lifts, backup power, security and parking. Many are offered furnished or semi-furnished, which makes them a practical choice for professionals and families relocating to the city.",
  },
  {
    name: "Upper Portion", slug: "upper-portion", pluralName: "Upper Portions", pluralSlug: "upper-portions", category: "RESIDENTIAL",
    description:
      "An upper portion is the first or second floor of a house rented separately, usually with its own entrance and meters. It offers house-style living at a lower monthly rent than an entire home.",
  },
  {
    name: "Lower Portion", slug: "lower-portion", pluralName: "Lower Portions", pluralSlug: "lower-portions", category: "RESIDENTIAL",
    description:
      "A lower portion is the ground floor of a house rented separately. Tenants often get easier access, a car porch and sometimes a lawn — a good fit for families with elderly members or young children.",
  },
  {
    name: "Room", slug: "room", pluralName: "Rooms", pluralSlug: "rooms", category: "RESIDENTIAL",
    description:
      "Single rooms for rent suit students and working professionals looking for a low monthly budget. Check whether utilities, internet and kitchen access are included in the rent.",
  },
  {
    name: "Farm House", slug: "farm-house", pluralName: "Farm Houses", pluralSlug: "farm-houses", category: "RESIDENTIAL",
    description:
      "Farm houses around Lahore offer open space, lawns and privacy on the city's outskirts, such as Bedian Road and Raiwind Road. They are rented for long stays as well as for events.",
  },
  {
    name: "Penthouse", slug: "penthouse", pluralName: "Penthouses", pluralSlug: "penthouses", category: "RESIDENTIAL",
    description:
      "Penthouses are top-floor apartments with extra space, terraces and views, typically in premium buildings in Gulberg, DHA and other central areas.",
  },
  {
    name: "Office", slug: "office", pluralName: "Offices", pluralSlug: "offices", category: "COMMERCIAL",
    description:
      "Office space for rent in Lahore ranges from small furnished units for startups to full floors in commercial plazas. Gulberg, DHA and Johar Town are established business districts with good road access.",
  },
  {
    name: "Shop", slug: "shop", pluralName: "Shops", pluralSlug: "shops", category: "COMMERCIAL",
    description:
      "Rental shops in Lahore are found in commercial markets, plazas and along main boulevards. Frontage, footfall, parking and whether the shop is on a main road matter as much as the monthly rent.",
  },
  {
    name: "Showroom", slug: "showroom", pluralName: "Showrooms", pluralSlug: "showrooms", category: "COMMERCIAL",
    description:
      "Showrooms offer wide frontage and large display floors on busy commercial roads — suited to car dealers, furniture, apparel and electronics retailers.",
  },
  {
    name: "Warehouse", slug: "warehouse", pluralName: "Warehouses", pluralSlug: "warehouses", category: "COMMERCIAL",
    description:
      "Warehouses for rent in Lahore are concentrated along the city's industrial corridors and ring road access points. Check covered area, ceiling height, loading access and three-phase electricity.",
  },
  {
    name: "Commercial Building", slug: "commercial-building", pluralName: "Commercial Buildings", pluralSlug: "commercial-buildings", category: "COMMERCIAL",
    description:
      "Entire commercial buildings are rented by corporate offices, schools, clinics and banks that need multiple floors, their own entrance and dedicated parking.",
  },
  {
    name: "Factory", slug: "factory", pluralName: "Factories", pluralSlug: "factories", category: "COMMERCIAL",
    description:
      "Factories for rent include covered sheds, offices and utilities suited to manufacturing. Verify electricity load, gas connection and road access for heavy vehicles.",
  },
  {
    name: "Industrial Building", slug: "industrial-building", pluralName: "Industrial Buildings", pluralSlug: "industrial-buildings", category: "COMMERCIAL",
    description:
      "Multi-storey industrial buildings are suited to light manufacturing, packaging and distribution businesses that need both production and storage space.",
  },
  {
    name: "Industrial Space", slug: "industrial-space", pluralName: "Industrial Spaces", pluralSlug: "industrial-spaces", category: "COMMERCIAL",
    description:
      "Industrial spaces — open plots with sheds, yards and workshops — are rented for manufacturing, storage and fabrication work on Lahore's outskirts.",
  },
];

export const AMENITIES: { name: string; slug: string; group: string }[] = [
  { name: "Parking", slug: "parking", group: "general" },
  { name: "Electricity", slug: "electricity", group: "utilities" },
  { name: "Gas", slug: "gas", group: "utilities" },
  { name: "Water", slug: "water", group: "utilities" },
  { name: "Security", slug: "security", group: "general" },
  { name: "Elevator", slug: "elevator", group: "general" },
  { name: "Generator", slug: "generator", group: "utilities" },
  { name: "Central Air Conditioning", slug: "central-ac", group: "general" },
  { name: "Swimming Pool", slug: "swimming-pool", group: "general" },
  { name: "Gym", slug: "gym", group: "general" },
  { name: "Servant Quarter", slug: "servant-quarter", group: "general" },
  { name: "Store Room", slug: "store-room", group: "general" },
  { name: "Balcony", slug: "balcony", group: "general" },
  { name: "Garden", slug: "garden", group: "general" },
  { name: "Terrace", slug: "terrace", group: "general" },
  { name: "Basement", slug: "basement", group: "general" },
];

export type SeedLocation = {
  name: string;
  slug: string;
  parent?: string;
  lat: number;
  lng: number;
  popular?: boolean;
  description?: string;
};

export const LOCATIONS: SeedLocation[] = [
  {
    name: "DHA Lahore", slug: "dha-lahore", lat: 31.4705, lng: 74.4095, popular: true,
    description:
      "DHA Lahore (Defence Housing Authority) is a large planned community made up of numbered phases in the east and south-east of the city, next to Lahore Cantonment. Rental options range from 5 Marla houses and apartments to 1 and 2 Kanal homes, plus offices and shops in its commercial blocks. Wide roads, parks and managed security make it one of the most requested rental areas in Lahore, and rents vary noticeably from phase to phase.",
  },
  { name: "DHA Phase 1", slug: "dha-phase-1", parent: "dha-lahore", lat: 31.4855, lng: 74.3985 },
  { name: "DHA Phase 2", slug: "dha-phase-2", parent: "dha-lahore", lat: 31.4895, lng: 74.4165 },
  { name: "DHA Phase 3", slug: "dha-phase-3", parent: "dha-lahore", lat: 31.4760, lng: 74.3805 },
  { name: "DHA Phase 4", slug: "dha-phase-4", parent: "dha-lahore", lat: 31.4655, lng: 74.3895 },
  { name: "DHA Phase 5", slug: "dha-phase-5", parent: "dha-lahore", lat: 31.4625, lng: 74.4105 },
  { name: "DHA Phase 6", slug: "dha-phase-6", parent: "dha-lahore", lat: 31.4715, lng: 74.4525 },
  { name: "DHA Phase 7", slug: "dha-phase-7", parent: "dha-lahore", lat: 31.4695, lng: 74.4870 },
  { name: "DHA Phase 8", slug: "dha-phase-8", parent: "dha-lahore", lat: 31.4935, lng: 74.4255 },
  { name: "DHA Phase 9", slug: "dha-phase-9", parent: "dha-lahore", lat: 31.4985, lng: 74.4745 },
  { name: "DHA Phase 9 Town", slug: "dha-phase-9-town", parent: "dha-lahore", lat: 31.4525, lng: 74.4205 },
  {
    name: "Bahria Town Lahore", slug: "bahria-town", lat: 31.3700, lng: 74.1850, popular: true,
    description:
      "Bahria Town Lahore is a gated private housing society in the south-west of the city with its own commercial areas, schools, hospital and parks. It offers a wide mix of rentals — apartments above commercial blocks, 5 to 10 Marla houses, larger homes and shops — and is popular with families looking for a self-contained community.",
  },
  {
    name: "Bahria Orchard", slug: "bahria-orchard", lat: 31.3600, lng: 74.2250,
    description:
      "Bahria Orchard is a planned housing society off Raiwind Road. Its newer phases offer comparatively budget-friendly houses and portions for rent, making it an option for families who want a gated community at a lower monthly rent.",
  },
  {
    name: "Gulberg", slug: "gulberg", lat: 31.5150, lng: 74.3500, popular: true,
    description:
      "Gulberg is central Lahore's main business and lifestyle district, known for MM Alam Road, Main Boulevard Gulberg and Liberty Market. It has a strong supply of offices, shops and apartments for rent, along with established residential streets offering larger houses. Its central location keeps demand steady from both businesses and families.",
  },
  { name: "Gulberg II", slug: "gulberg-2", parent: "gulberg", lat: 31.5220, lng: 74.3480 },
  { name: "Gulberg III", slug: "gulberg-3", parent: "gulberg", lat: 31.5080, lng: 74.3450 },
  {
    name: "Johar Town", slug: "johar-town", lat: 31.4690, lng: 74.2720, popular: true,
    description:
      "Johar Town is a large, well-connected residential and commercial area in south-west Lahore, close to the Expo Centre, Emporium Mall and several universities and hospitals. It has one of the city's widest ranges of rental stock — houses, portions, flats, rooms, offices and shops — which makes it a common choice for students, professionals and families.",
  },
  {
    name: "Model Town", slug: "model-town", lat: 31.4830, lng: 74.3260, popular: true,
    description:
      "Model Town is one of Lahore's oldest planned neighbourhoods, laid out in the 1920s with a distinctive circular plan and tree-lined roads. Rentals are mostly spacious family houses and portions, with commercial options in Model Town Link Road and the surrounding markets.",
  },
  {
    name: "Garden Town", slug: "garden-town", lat: 31.5020, lng: 74.3200,
    description:
      "Garden Town is a central residential area between Model Town and Gulberg with established houses, portions and offices close to main arteries such as Ferozepur Road and the Canal.",
  },
  {
    name: "Wapda Town", slug: "wapda-town", lat: 31.4330, lng: 74.2650, popular: true,
    description:
      "Wapda Town is a planned residential society in south-west Lahore near Johar Town, known for its family houses, parks and commercial areas. It offers houses and portions across a wide range of plot sizes.",
  },
  {
    name: "Valencia Town", slug: "valencia-town", lat: 31.4050, lng: 74.2550,
    description:
      "Valencia Town is a gated housing society off Defence Road with houses, portions and a commercial area. It is popular with families who want a managed community near Wapda Town and Raiwind Road.",
  },
  {
    name: "Lake City", slug: "lake-city", lat: 31.3780, lng: 74.2640,
    description:
      "Lake City is a gated society on Raiwind Road with newer construction, a golf course and landscaped areas. Rentals are mainly modern family houses and upper or lower portions.",
  },
  {
    name: "Askari", slug: "askari", lat: 31.5050, lng: 74.4000,
    description:
      "Askari housing schemes in Lahore (such as Askari 10 and Askari 11) are gated communities with apartment blocks and houses. Apartments here are a common choice for families wanting managed buildings with security and parking.",
  },
  {
    name: "Lahore Cantt", slug: "cantt", lat: 31.5100, lng: 74.3850, popular: true,
    description:
      "Lahore Cantonment is a central, well-maintained area with a mix of older bungalows, houses, apartments and commercial space along its main roads. Its proximity to Gulberg, DHA and the airport keeps rental demand steady.",
  },
  {
    name: "Faisal Town", slug: "faisal-town", lat: 31.4790, lng: 74.3050,
    description:
      "Faisal Town is a central residential area near Model Town and Johar Town with houses, portions and offices, and easy access to Maulana Shaukat Ali Road and Akbar Chowk.",
  },
  {
    name: "Township", slug: "township", lat: 31.4500, lng: 74.3050,
    description:
      "Township is a large, established area in south Lahore with comparatively affordable houses, portions and shops, close to Green Town and College Road.",
  },
  {
    name: "Allama Iqbal Town", slug: "allama-iqbal-town", lat: 31.5130, lng: 74.2880, popular: true,
    description:
      "Allama Iqbal Town is a mature, densely populated area in west Lahore organised into named blocks, with Moon Market as its commercial centre. It offers houses, portions, flats and shops at mid-range rents.",
  },
  {
    name: "Sabzazar", slug: "sabzazar", lat: 31.5250, lng: 74.2700,
    description:
      "Sabzazar is a residential scheme near Allama Iqbal Town and Multan Road, offering houses and portions at relatively affordable rents.",
  },
  {
    name: "Muslim Town", slug: "muslim-town", lat: 31.5170, lng: 74.3130,
    description:
      "Muslim Town is a central residential area along the Canal near Wahdat Road, close to several universities, making rooms and portions popular with students.",
  },
  {
    name: "PIA Housing Society", slug: "pia-housing-society", lat: 31.4610, lng: 74.2860,
    description:
      "PIA Housing Society is a residential society beside Johar Town offering houses and portions, with easy access to Johar Town's commercial areas.",
  },
  {
    name: "LDA Avenue", slug: "lda-avenue", lat: 31.4270, lng: 74.2400,
    description:
      "LDA Avenue is a Lahore Development Authority scheme on Raiwind Road with a growing number of newly built houses and portions available for rent.",
  },
  {
    name: "Central Park", slug: "central-park", lat: 31.3780, lng: 74.3620,
    description:
      "Central Park Housing Scheme is a gated society off Ferozepur Road with newer houses and portions, and is typically more affordable than central Lahore.",
  },
  {
    name: "Jubilee Town", slug: "jubilee-town", lat: 31.4190, lng: 74.2460,
    description:
      "Jubilee Town is a residential society near Johar Town and Wapda Town with houses and portions at mid-range rents.",
  },
  {
    name: "Fazaia Housing Scheme", slug: "fazaia-housing-scheme", lat: 31.4000, lng: 74.2000,
    description:
      "Fazaia Housing Scheme is a planned residential community on Raiwind Road with newly built houses and portions.",
  },
  {
    name: "State Life Housing Society", slug: "state-life-housing-society", lat: 31.4560, lng: 74.3820,
    description:
      "State Life Housing Society is a residential area in south-east Lahore offering houses and portions, with road access towards DHA.",
  },
  {
    name: "Raiwind Road", slug: "raiwind-road", lat: 31.4050, lng: 74.2300,
    description:
      "Raiwind Road is a major corridor in south-west Lahore lined with housing societies, farm houses, warehouses and commercial space.",
  },
  {
    name: "Bedian Road", slug: "bedian-road", lat: 31.4450, lng: 74.4950,
    description:
      "Bedian Road, beyond DHA's eastern phases, is known for farm houses and larger plots, and offers open space within reach of the city.",
  },
];
