/**
 * Editorial content for Lahore area pages (/rent/<area>/).
 * Facts are kept general and well established; rents come from the live snapshot on the page.
 * Inline syntax: [text](/path/) and **bold**.
 */
import type { LandingContent } from "./landing-types-def";

export const AREA_CONTENT: Record<string, LandingContent> = {
  "dha-lahore": {
    seoTitle: "Property for Rent in DHA Lahore | RentNest Lahore",
    metaDescription:
      "Houses, upper portions, apartments and offices for rent in DHA Lahore, all phases. Compare monthly rent by phase, photos and contact owners and agents directly.",
    sections: [
      {
        h: "Who DHA suits",
        p: [
          "DHA Lahore is the first choice for many families who want planned streets, parks, reliable security and a strong commercial scene. It is also popular with companies for offices in its commercial areas, and with expats and professionals who want modern homes close to Lahore Cantt and the airport.",
        ],
      },
      {
        h: "Phases at a glance",
        ul: [
          "**Older phases (1 to 4)**: closer to Cantt, fully developed with mature trees and established markets such as Y Block in Phase 3.",
          "**Phases 5 and 6**: large, popular residential phases with many modern houses and good commercial areas.",
          "**Newer phases (7, 8, 9)**: more recently built homes, often at lower rents, with a slightly longer drive to the city centre.",
          "Browse by phase: [Phase 1](/rent/dha-phase-1/), [Phase 2](/rent/dha-phase-2/), [Phase 3](/rent/dha-phase-3/), [Phase 4](/rent/dha-phase-4/), [Phase 5](/rent/dha-phase-5/), [Phase 6](/rent/dha-phase-6/), [Phase 7](/rent/dha-phase-7/), [Phase 8](/rent/dha-phase-8/).",
        ],
      },
      {
        h: "What you can rent in DHA",
        ul: [
          "[Houses](/rent/dha-lahore/houses/) from 5 Marla to 2 Kanal.",
          "Upper and lower [portions](/rent/portions/) of larger homes, a popular way to live in DHA for less.",
          "[Apartments](/rent/apartments/) in newer buildings and commercial zones.",
          "[Offices](/rent/dha-lahore/offices/) and shops in commercial blocks.",
        ],
      },
      {
        h: "Tips for renting in DHA",
        ul: [
          "Compare like-for-like: the same size house can rent very differently from one phase to another, so check the rent snapshot below.",
          "Ask whether DHA maintenance and security charges are included in the rent.",
          "Keep CNIC copies ready: tenant details must be registered with the police, and some phases have their own entry procedures.",
          "For portions, confirm separate meters and who uses the car porch.",
        ],
      },
    ],
    faqs: [
      { q: "Which DHA phase is best to rent in?", a: "It depends on your budget and commute. Older phases (1 to 4) are closest to Cantt and fully developed; Phases 5 and 6 are popular family areas with modern homes; newer phases usually offer lower rents with a longer drive." },
      { q: "Can I rent a portion in DHA?", a: "Yes. Many larger DHA houses are rented as separate upper and lower portions, which is one of the most affordable ways to live in DHA." },
      { q: "Is DHA good for offices?", a: "Yes. DHA's commercial areas have modern office buildings with better parking than many central areas, and they are popular with software houses, consultancies and brand offices." },
      { q: "How much is rent in DHA Lahore?", a: "The rent snapshot on this page shows the median and range of asking rents for each property type in DHA, based on current listings. Rents vary a lot by phase and plot size." },
    ],
  },

  "bahria-town": {
    seoTitle: "Property for Rent in Bahria Town Lahore | RentNest Lahore",
    metaDescription: "Houses, apartments and portions for rent in Bahria Town Lahore. Compare rents by sector, see photos and contact owners and agents directly.",
    sections: [
      {
        h: "Living in Bahria Town Lahore",
        p: [
          "Bahria Town Lahore is a large gated community in the south-west of the city, off Canal Road. It has its own schools, hospital, mosques (including the Grand Jamia Mosque), parks and commercial areas, so daily needs are close at hand. Families often choose it for its facilities, controlled access and well-kept surroundings.",
        ],
      },
      {
        h: "What you can rent",
        ul: [
          "[Houses](/rent/bahria-town/houses/): 5, 8 and 10 Marla homes are the most common, plus 1 Kanal homes in established sectors.",
          "Apartments above commercial blocks, a budget-friendly way into Bahria Town.",
          "Shops and offices in the commercial areas.",
          "Nearby alternative: [Bahria Orchard](/rent/bahria-orchard/) on Raiwind Road, often at lower rents.",
        ],
      },
      {
        h: "Things to consider",
        ul: [
          "**Commute**: Bahria Town is some distance from Gulberg and the city centre; test your route at peak hours.",
          "**Maintenance charges**: confirm whether the tenant or owner pays them.",
          "**Utilities**: ask how electricity and water are billed in the specific sector.",
          "**Access**: ask how residents' vehicle stickers or passes are issued to tenants.",
        ],
      },
    ],
    faqs: [
      { q: "Is Bahria Town good for families?", a: "Many families choose Bahria Town for its schools, hospital, parks and gated security. The main trade-off is a longer commute to central Lahore." },
      { q: "Are there apartments for rent in Bahria Town?", a: "Yes. Apartments above commercial blocks are common and usually cheaper than houses in the same community." },
      { q: "What is the difference between Bahria Town and Bahria Orchard?", a: "They are separate developments. Bahria Orchard is on Raiwind Road and generally offers lower rents; Bahria Town is older and more established with more facilities." },
    ],
  },

  gulberg: {
    seoTitle: "Property for Rent in Gulberg Lahore | RentNest Lahore",
    metaDescription: "Offices, apartments, flats and houses for rent in Gulberg, Lahore, near MM Alam Road, Main Boulevard and Liberty Market. Compare rents and contact owners directly.",
    sections: [
      {
        h: "Why rent in Gulberg",
        p: [
          "Gulberg is central Lahore's business and lifestyle district, home to MM Alam Road, Main Boulevard, Liberty Market and Hafeez Centre. It is the natural choice if you work nearby, run a client-facing business, or want restaurants, shopping and offices within minutes.",
        ],
      },
      {
        h: "What you can rent",
        ul: [
          "[Offices](/rent/gulberg/offices/): from small furnished units to full floors on Main Boulevard and surrounding roads.",
          "[Apartments](/rent/apartments/) and [flats](/rent/flats/): popular with professionals, often furnished.",
          "Larger houses on quieter residential streets in [Gulberg II](/rent/gulberg-2/) and [Gulberg III](/rent/gulberg-3/).",
          "[Shops](/rent/shops/) and showrooms on commercial roads.",
        ],
      },
      {
        h: "Tips for renting in Gulberg",
        ul: [
          "Traffic on the main boulevards is heavy at peak hours. A place on a side street can be much quieter.",
          "For offices and apartments, ask about building maintenance charges, parking allocation and backup power.",
          "Nearby alternatives: [Lahore Cantt](/rent/cantt/), [Garden Town](/rent/garden-town/) and [Model Town](/rent/model-town/).",
        ],
      },
    ],
    faqs: [
      { q: "Is Gulberg good for an office?", a: "Yes. Gulberg is Lahore's central business district with high visibility and access to clients, banks and services. Parking can be limited, so check allocation." },
      { q: "Can I find a furnished apartment in Gulberg?", a: "Yes, furnished apartments are common in Gulberg. Use the Furnishing filter to see them." },
      { q: "What is the difference between Gulberg II and Gulberg III?", a: "Both are parts of Gulberg with a mix of residential streets and commercial roads. You can browse each separately using the links on this page." },
    ],
  },

  "johar-town": {
    seoTitle: "Property for Rent in Johar Town Lahore | RentNest Lahore",
    metaDescription: "Houses, portions, flats, rooms and offices for rent in Johar Town, Lahore, near Expo Centre, Emporium Mall, universities and hospitals. Compare rents and contact owners.",
    sections: [
      {
        h: "Why Johar Town is so popular with renters",
        p: [
          "Johar Town is one of Lahore's largest and best-connected areas, with easy access to Canal Road and Khayaban-e-Jinnah. Expo Centre, Emporium Mall, several universities and major hospitals are nearby, which is why it has one of the widest ranges of rentals in the city, from single rooms for students to family houses and offices.",
        ],
      },
      {
        h: "Who it suits",
        ul: [
          "**Students**: [rooms](/rent/rooms/) and shared flats near universities.",
          "**Young professionals**: flats and upper portions close to offices and main roads.",
          "**Families**: [houses](/rent/johar-town/houses/) and [portions](/rent/portions/) in residential blocks.",
          "**Businesses**: offices and shops on the main commercial roads.",
        ],
      },
      {
        h: "Tips for renting in Johar Town",
        ul: [
          "Blocks differ a lot in character. Some are quiet residential streets, others busy commercial strips. Visit in the evening as well as the daytime.",
          "For rooms and flats, confirm what utilities and internet are included in the rent.",
          "Compare nearby [PIA Housing Society](/rent/pia-housing-society/), [Wapda Town](/rent/wapda-town/) and [Jubilee Town](/rent/jubilee-town/) for similar homes.",
          "Read our [Johar Town rental guide](/guides/johar-town-rental-guide/).",
        ],
      },
    ],
    faqs: [
      { q: "Is Johar Town good for students?", a: "Yes. It is close to several universities and has many rooms, flats and portions at mid-range rents, plus good public transport and food options." },
      { q: "Is Johar Town safe for families?", a: "Many families live in Johar Town's residential blocks. As with any area, visit the specific street, check the neighbourhood and meet the landlord before renting." },
      { q: "Which areas are near Johar Town?", a: "PIA Housing Society, Wapda Town, Jubilee Town, Faisal Town and Township are all close by and often have similar rental options." },
    ],
  },

  "model-town": {
    seoTitle: "Property for Rent in Model Town Lahore | RentNest Lahore",
    metaDescription: "Houses, portions and offices for rent in Model Town, Lahore. Spacious homes on tree-lined roads near Ferozepur Road. Compare rents and contact owners directly.",
    sections: [
      {
        h: "About renting in Model Town",
        p: [
          "Model Town is one of Lahore's oldest planned neighbourhoods, laid out in the 1920s with a distinctive circular plan, lettered blocks and the large Model Town Park at its centre. Rentals are mostly spacious family houses and portions on quiet, tree-lined roads, with commercial space on Model Town Link Road and nearby Ferozepur Road.",
        ],
        ul: [
          "Good for families who want a central, established, green neighbourhood.",
          "Easy access to Ferozepur Road and the Metro Bus route.",
          "Older houses can be large, so check the condition of wiring, plumbing and roofs.",
          "Nearby: [Garden Town](/rent/garden-town/), [Faisal Town](/rent/faisal-town/) and [Township](/rent/township/).",
        ],
      },
    ],
    faqs: [
      { q: "Are houses in Model Town old?", a: "Many are older, well-built homes, while some have been rebuilt. Check the condition carefully and agree any repairs in writing before moving in." },
      { q: "Is Model Town good for offices?", a: "Offices are available on Model Town Link Road and surrounding commercial roads, often at lower rents than Gulberg." },
    ],
  },

  "wapda-town": {
    seoTitle: "Property for Rent in Wapda Town Lahore | RentNest Lahore",
    metaDescription: "Houses and portions for rent in Wapda Town, Lahore. Family homes near Johar Town with parks and commercial areas.",
    sections: [
      {
        h: "About renting in Wapda Town",
        p: [
          "Wapda Town is a planned residential society in south-west Lahore next to Johar Town, known for family houses, parks and its own commercial areas. It offers houses and portions across a wide range of plot sizes, usually at more moderate rents than central Lahore.",
        ],
        ul: [
          "Good for families who want Johar Town's convenience in a quieter setting.",
          "Access via Raiwind Road and Canal Road links.",
          "Nearby: [Johar Town](/rent/johar-town/), [Valencia](/rent/valencia-town/), [PIA Housing Society](/rent/pia-housing-society/).",
        ],
      },
    ],
    faqs: [
      { q: "What kind of homes are available in Wapda Town?", a: "Mainly family houses and upper/lower portions in a range of plot sizes." },
    ],
  },

  cantt: {
    seoTitle: "Property for Rent in Lahore Cantt | RentNest Lahore",
    metaDescription: "Houses, apartments and offices for rent in Lahore Cantt, a central and well-kept area close to Gulberg, DHA and the airport.",
    sections: [
      {
        h: "About renting in Lahore Cantt",
        p: [
          "Lahore Cantonment is a central, well-maintained area with older bungalows, houses, apartments and commercial space along its main roads. Its location between Gulberg, DHA and the airport keeps rental demand steady.",
        ],
        ul: [
          "Some parts have security checkpoints and specific rules for residents and tenants. Ask the landlord what applies.",
          "Commercial space is available around Fortress Stadium and main Cantt roads.",
          "Nearby: [DHA Lahore](/rent/dha-lahore/), [Askari](/rent/askari/), [Gulberg](/rent/gulberg/).",
        ],
      },
    ],
    faqs: [
      { q: "Are there restrictions on renting in Cantt?", a: "Some Cantonment areas have their own procedures for tenants and visitors. The landlord or agent can explain the requirements for a particular property." },
    ],
  },

  "allama-iqbal-town": {
    seoTitle: "Property for Rent in Allama Iqbal Town Lahore | RentNest Lahore",
    metaDescription: "Houses, portions, flats and shops for rent in Allama Iqbal Town, Lahore, around Moon Market and Karim Block, at mid-range rents.",
    sections: [
      {
        h: "About renting in Allama Iqbal Town",
        p: [
          "Allama Iqbal Town is a mature, densely populated area in west Lahore organised into named blocks, with Moon Market and Karim Block market as its busy commercial centres. It offers houses, portions, flats and shops at mid-range rents, with good access to Multan Road and the Canal.",
        ],
        ul: [
          "Good for families and students who want an established area with markets nearby.",
          "Flats above markets are an affordable option, but check noise and parking.",
          "Nearby: [Sabzazar](/rent/sabzazar/), [Muslim Town](/rent/muslim-town/), [Johar Town](/rent/johar-town/).",
        ],
      },
    ],
    faqs: [
      { q: "Is Allama Iqbal Town the same as Iqbal Town?", a: "Yes. Allama Iqbal Town is commonly called Iqbal Town. All its listings are shown on this page." },
    ],
  },

  township: {
    seoTitle: "Property for Rent in Township Lahore | RentNest Lahore",
    metaDescription: "Affordable houses, portions and shops for rent in Township, Lahore, near Green Town and College Road.",
    sections: [
      {
        h: "About renting in Township",
        p: [
          "Township is a large, established area in south Lahore with comparatively affordable houses, portions and shops. It is well connected to Johar Town, Faisal Town and Model Town via Akbar Chowk and College Road.",
        ],
        ul: [
          "A good choice for families looking for value close to central-south Lahore.",
          "Many portions are available. Confirm separate meters before you agree.",
          "Nearby: [Faisal Town](/rent/faisal-town/), [Johar Town](/rent/johar-town/), [Model Town](/rent/model-town/).",
        ],
      },
    ],
    faqs: [],
  },

  "garden-town": {
    seoTitle: "Property for Rent in Garden Town Lahore | RentNest Lahore",
    metaDescription: "Houses, portions and offices for rent in Garden Town, Lahore, a central area between Model Town and Gulberg near Kalma Chowk.",
    sections: [
      {
        h: "About renting in Garden Town",
        p: [
          "Garden Town is a central residential area between Model Town and Gulberg, close to Kalma Chowk, Ferozepur Road and the Canal. It has established houses, portions and offices, with Barkat Market as a nearby shopping hub.",
        ],
        ul: [
          "Central location with quick access to Gulberg and Ferozepur Road.",
          "Good for families and for small offices.",
          "Nearby: [Model Town](/rent/model-town/), [Gulberg](/rent/gulberg/), [Faisal Town](/rent/faisal-town/).",
        ],
      },
    ],
    faqs: [],
  },

  "faisal-town": {
    seoTitle: "Property for Rent in Faisal Town Lahore | RentNest Lahore",
    metaDescription: "Houses, portions and offices for rent in Faisal Town, Lahore, a central area near Model Town and Johar Town.",
    sections: [
      {
        h: "About renting in Faisal Town",
        p: [
          "Faisal Town is a central residential area near Model Town and Johar Town with houses, portions and offices, and easy access to Maulana Shaukat Ali Road and Akbar Chowk. Its central location makes it convenient for both families and small businesses.",
        ],
        ul: ["Nearby: [Model Town](/rent/model-town/), [Johar Town](/rent/johar-town/), [Township](/rent/township/)."],
      },
    ],
    faqs: [],
  },

  "valencia-town": {
    seoTitle: "Property for Rent in Valencia Town Lahore | RentNest Lahore",
    metaDescription: "Houses and portions for rent in Valencia Town, Lahore, a gated society near Wapda Town and Raiwind Road.",
    sections: [
      {
        h: "About renting in Valencia Town",
        p: [
          "Valencia Town is a gated housing society near Wapda Town with houses, portions and a commercial area. Families choose it for a managed community with parks, at lower rents than central Lahore.",
        ],
        ul: ["Nearby: [Wapda Town](/rent/wapda-town/), [Lake City](/rent/lake-city/), [Johar Town](/rent/johar-town/)."],
      },
    ],
    faqs: [],
  },

  "lake-city": {
    seoTitle: "Property for Rent in Lake City Lahore | RentNest Lahore",
    metaDescription: "Modern houses and portions for rent in Lake City, Lahore, a gated society on Raiwind Road with a golf course and landscaped areas.",
    sections: [
      {
        h: "About renting in Lake City",
        p: [
          "Lake City is a gated society on Raiwind Road known for newer construction, a golf course and landscaped surroundings. Rentals are mainly modern family houses and upper or lower portions.",
        ],
        ul: [
          "Good for families who want a newer, quieter community.",
          "Check your commute to central Lahore at peak hours.",
          "Nearby: [Valencia](/rent/valencia-town/), [LDA Avenue](/rent/lda-avenue/), [Bahria Orchard](/rent/bahria-orchard/).",
        ],
      },
    ],
    faqs: [],
  },

  askari: {
    seoTitle: "Property for Rent in Askari Lahore | RentNest Lahore",
    metaDescription: "Apartments and houses for rent in Askari housing schemes, Lahore. These gated communities have strong security and parking.",
    sections: [
      {
        h: "About renting in Askari",
        p: [
          "Askari housing schemes in Lahore (such as Askari 10 and Askari 11) are gated communities with apartment blocks and houses. Apartments here are popular with families who want managed buildings with security and parking.",
        ],
        ul: [
          "Ask about the scheme's tenant registration procedures and entry passes.",
          "Nearby: [Lahore Cantt](/rent/cantt/), [DHA Lahore](/rent/dha-lahore/).",
        ],
      },
    ],
    faqs: [],
  },

  "bahria-orchard": {
    seoTitle: "Property for Rent in Bahria Orchard Lahore | RentNest Lahore",
    metaDescription: "Houses and portions for rent in Bahria Orchard, Lahore, for budget-friendly gated living on Raiwind Road.",
    sections: [
      {
        h: "About renting in Bahria Orchard",
        p: [
          "Bahria Orchard is a planned housing society off Raiwind Road. Its newer phases offer comparatively budget-friendly houses and portions for rent, an option for families who want a gated community at a lower monthly rent.",
        ],
        ul: ["Compare with [Bahria Town](/rent/bahria-town/), [Lake City](/rent/lake-city/) and [LDA Avenue](/rent/lda-avenue/)."],
      },
    ],
    faqs: [],
  },

  "lda-avenue": {
    seoTitle: "Houses for Rent in LDA Avenue Lahore | RentNest Lahore",
    metaDescription: "Houses and portions for rent in LDA Avenue, Lahore, a Lahore Development Authority scheme on Raiwind Road. See current listings and contact owners directly.",
    sections: [
      {
        h: "Renting in LDA Avenue",
        p: [
          "LDA Avenue is a housing scheme developed by the Lahore Development Authority off Raiwind Road. Much of it has been built in recent years, so most rentals are newer houses and upper or lower portions, usually at lower rents than older central areas.",
          "Because it is a government-planned scheme, roads and plots are laid out on a regular plan, and families who want a newer home at a moderate rent often look here alongside [Valencia Town](/rent/valencia-town/), [Bahria Orchard](/rent/bahria-orchard/) and [Wapda Town](/rent/wapda-town/).",
        ],
      },
      {
        h: "Things to check before renting",
        ul: [
          "**Development in the block:** some blocks are fully built and lived in, others still have empty plots and construction. Visit the street, not just the house.",
          "**Commute:** test your route to work or school at peak time, especially if you will use Raiwind Road or the Ring Road every day.",
          "**Utilities:** confirm the house has its own electricity and gas meters, and ask about water supply and any pending connections.",
          "**Security and markets:** ask where the nearest market, mosque, school and pharmacy are, and how the area feels in the evening.",
        ],
      },
      {
        h: "Nearby areas to compare",
        ul: [
          "[Valencia Town](/rent/valencia-town/) and [Wapda Town](/rent/wapda-town/): more established, often at higher rents.",
          "[Bahria Orchard](/rent/bahria-orchard/) and [Bahria Town](/rent/bahria-town/): gated communities with their own facilities.",
          "[Fazaia Housing Scheme](/rent/fazaia-housing-scheme/) and [Lake City](/rent/lake-city/): other newer communities on Raiwind Road.",
        ],
      },
    ],
    faqs: [
      { q: "Where is LDA Avenue in Lahore?", a: "LDA Avenue is a Lahore Development Authority housing scheme off Raiwind Road, in the south-west of the city, near areas such as Valencia Town and Bahria Orchard." },
      { q: "Is LDA Avenue good for renting a house?", a: "It suits families who want a newer house or portion at a moderate rent and don't mind a longer drive to central Lahore. Check how developed the specific block is before you decide." },
      { q: "What kind of rentals are available in LDA Avenue?", a: "Mostly newly built houses and upper or lower portions. The listings on this page show what is currently available." },
    ],
  },

  "fazaia-housing-scheme": {
    seoTitle: "Houses for Rent in Fazaia Housing Scheme Lahore | RentNest Lahore",
    metaDescription: "Houses and portions for rent in Fazaia Housing Scheme, Lahore, a planned community on Raiwind Road. See current listings and contact owners directly.",
    sections: [
      {
        h: "Renting in Fazaia Housing Scheme",
        p: [
          "Fazaia Housing Scheme is a planned residential community on Raiwind Road, developed for Pakistan Air Force personnel and their families, with many homes also rented out to civilians. It is newer than most of Lahore's established areas, so rentals are mostly recently built houses and portions.",
          "Tenants usually choose it for a calm, organised neighbourhood at a lower rent than central Lahore, accepting a longer commute in return.",
        ],
      },
      {
        h: "Things to check before renting",
        ul: [
          "**Society rules for tenants:** ask the owner whether the society office needs tenant details or verification, and what documents it asks for. This is in addition to [police tenant registration](/guides/tenant-registration-in-lahore/).",
          "**Which phase and block:** development differs from one part of the scheme to another. Visit the street and see how many houses are occupied.",
          "**Meters and water:** confirm separate electricity and gas meters for portions, and ask how water is supplied.",
          "**Commute:** check your daily route along Raiwind Road at peak hours.",
        ],
      },
      {
        h: "Nearby areas to compare",
        ul: [
          "[LDA Avenue](/rent/lda-avenue/) and [Lake City](/rent/lake-city/): other newer communities in the same part of the city.",
          "[Bahria Town](/rent/bahria-town/) and [Bahria Orchard](/rent/bahria-orchard/): gated societies with their own commercial areas.",
          "[Valencia Town](/rent/valencia-town/): more established, closer to Johar Town.",
        ],
      },
    ],
    faqs: [
      { q: "Can civilians rent a house in Fazaia Housing Scheme Lahore?", a: "Yes. Many owners rent their homes to civilian families. The society may ask for tenant details, so ask the owner about its requirements before you move in." },
      { q: "Where is Fazaia Housing Scheme in Lahore?", a: "It is on Raiwind Road in the south-west of Lahore, in the same part of the city as LDA Avenue, Lake City and Bahria Town." },
      { q: "What should I check before renting in Fazaia Housing Scheme?", a: "Check the society's tenant requirements, how developed your block is, separate meters, water supply and your commute along Raiwind Road." },
    ],
  },
};

/** Area + property type pages with enough demand for dedicated content. */
export const COMBO_CONTENT: Record<string, LandingContent> = {
  "dha-lahore/houses": {
    seoTitle: "Houses for Rent in DHA Lahore | RentNest Lahore",
    metaDescription: "Houses for rent in DHA Lahore, all phases: 5 Marla, 10 Marla, 1 Kanal and 2 Kanal homes. Compare rent by phase and contact owners directly.",
    sections: [
      {
        h: "Choosing a rental house in DHA",
        p: [
          "In DHA, the **phase** and **plot size** drive the rent more than anything else. 5 Marla houses are common in newer phases and suit smaller families; 10 Marla and 1 Kanal houses dominate the established phases, with lawns, servant quarters and space for several cars.",
          "If a full house is over budget, an upper or lower portion of a 1 Kanal home in the same phase is often a good compromise.",
        ],
      },
    ],
    faqs: [
      { q: "What size houses are available for rent in DHA?", a: "From 5 Marla homes to 2 Kanal bungalows. Use the Area filter (in Marla or Kanal) to see only the sizes you want." },
    ],
  },
  "johar-town/houses": {
    seoTitle: "Houses for Rent in Johar Town Lahore | RentNest Lahore",
    metaDescription: "Houses for rent in Johar Town, Lahore. Family homes of 5 Marla, 10 Marla and 1 Kanal near universities, hospitals and Expo Centre.",
    sections: [
      {
        h: "Renting a house in Johar Town",
        p: [
          "Johar Town has houses in most sizes, from 5 Marla homes in residential blocks to 1 Kanal houses on wider roads. Because the area is so central to universities, hospitals and Canal Road, well-kept houses are rented quickly. Shortlist a few and arrange visits the same week.",
        ],
      },
    ],
    faqs: [],
  },
  "bahria-town/houses": {
    seoTitle: "Houses for Rent in Bahria Town Lahore | RentNest Lahore",
    metaDescription: "Houses for rent in Bahria Town Lahore. Family homes from 5 Marla to 1 Kanal in a gated community.",
    sections: [
      {
        h: "Renting a house in Bahria Town",
        p: [
          "5, 8 and 10 Marla houses are the most common rentals in Bahria Town, with 1 Kanal homes in the older sectors. Ask about maintenance charges, the sector's utility billing and how tenants get vehicle access passes.",
        ],
      },
    ],
    faqs: [],
  },
  "gulberg/offices": {
    seoTitle: "Office Space for Rent in Gulberg Lahore | RentNest Lahore",
    metaDescription: "Office space for rent in Gulberg, Lahore. Furnished and unfurnished offices near Main Boulevard and MM Alam Road.",
    sections: [
      {
        h: "Renting an office in Gulberg",
        p: [
          "Gulberg offices range from small furnished suites for startups to full floors in corporate buildings along Main Boulevard and surrounding roads. Parking is the main constraint in Gulberg, so ask for the number of allocated spaces, and check backup power, internet providers and after-hours access.",
        ],
      },
    ],
    faqs: [],
  },
  "dha-lahore/offices": {
    seoTitle: "Office Space for Rent in DHA Lahore | RentNest Lahore",
    metaDescription: "Offices for rent in DHA Lahore's commercial areas, in modern buildings with parking, security and backup power.",
    sections: [
      {
        h: "Renting an office in DHA",
        p: [
          "DHA's commercial areas offer modern office buildings with better parking than most central areas. They are popular with software houses, consultancies and brand offices. Confirm that the building is approved for office use and ask about service charges and generator backup.",
        ],
      },
    ],
    faqs: [],
  },
};
