/**
 * Seed script.
 *   npm run db:seed        -> taxonomy (types, amenities, Lahore locations) + admin account
 *   npm run db:seed:demo   -> the above + clearly-labelled DEMO agents and DEMO rental listings
 *
 * Demo records: isDemo = true, "Demo Listing" badge in the UI, "(Demo)" in agent names,
 * invalid placeholder phone numbers (+92 000 ...), and illustrated "Sample image" photos.
 * Remove them any time with: npm run db:remove-demo
 */
import { PrismaClient, type AreaUnit, type FurnishedStatus, type PropertyCondition, type PropertyStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AMENITIES, LOCATIONS, PROPERTY_TYPES } from "../src/data/taxonomy";
import { toSqft } from "../src/lib/area";
import { generateTitle, slugify, titleToSlug } from "../src/lib/slug";

const prisma = new PrismaClient();
const WITH_DEMO = process.argv.includes("--demo");

// Deterministic PRNG so demo data is reproducible
let seed = 20260925;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const between = (a: number, b: number) => a + Math.floor(rand() * (b - a + 1));
const chance = (p: number) => rand() < p;
const roundTo = (n: number, step: number) => Math.max(step, Math.round(n / step) * step);

async function seedTaxonomy() {
  for (const [i, t] of PROPERTY_TYPES.entries()) {
    await prisma.propertyType.upsert({
      where: { slug: t.slug },
      create: { ...t, sortOrder: i },
      update: {},
    });
  }
  for (const [i, a] of AMENITIES.entries()) {
    await prisma.amenity.upsert({ where: { slug: a.slug }, create: { ...a, sortOrder: i }, update: {} });
  }
  for (const [i, l] of LOCATIONS.entries()) {
    const parent = l.parent ? await prisma.location.findUnique({ where: { slug: l.parent } }) : null;
    await prisma.location.upsert({
      where: { slug: l.slug },
      create: {
        name: l.name, slug: l.slug, parentId: parent?.id, latitude: l.lat, longitude: l.lng,
        isPopular: !!l.popular, description: l.description, sortOrder: i,
      },
      update: {},
    });
  }
  console.log(`Taxonomy: ${PROPERTY_TYPES.length} property types, ${AMENITIES.length} amenities, ${LOCATIONS.length} locations`);
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("Admin: skipped (set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one)");
    return;
  }
  if (password.length < 10) throw new Error("SEED_ADMIN_PASSWORD must be at least 10 characters");
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "ADMIN") await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
    console.log(`Admin: ${email} already exists`);
    return;
  }
  await prisma.user.create({
    data: { email, name: "RentNest Admin", role: "ADMIN", emailVerifiedAt: new Date(), passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`Admin: created ${email}`);
}

// ---------------------------------------------------------------- demo data

const DEMO_AGENTS = [
  { name: "Nestway Estates (Demo)", agency: "Nestway Estates — Demo Agency", type: "AGENT" as const, areas: ["dha-lahore", "cantt", "askari", "state-life-housing-society"] },
  { name: "Brickline Realty (Demo)", agency: "Brickline Realty — Demo Agency", type: "AGENT" as const, areas: ["gulberg", "garden-town", "model-town", "muslim-town"] },
  { name: "Canal Side Properties (Demo)", agency: "Canal Side Properties — Demo Agency", type: "AGENT" as const, areas: ["johar-town", "pia-housing-society", "wapda-town", "jubilee-town", "faisal-town"] },
  { name: "Orchard Gate Realtors (Demo)", agency: "Orchard Gate Realtors — Demo Agency", type: "AGENT" as const, areas: ["bahria-town", "bahria-orchard", "lake-city", "valencia-town", "fazaia-housing-scheme"] },
  { name: "Township Homes (Demo)", agency: "Township Homes — Demo Agency", type: "AGENT" as const, areas: ["township", "allama-iqbal-town", "central-park", "lda-avenue", "sabzazar"] },
  { name: "Ring Road Commercial (Demo)", agency: "Ring Road Commercial — Demo Agency", type: "AGENT" as const, areas: ["raiwind-road", "bedian-road"] },
  { name: "Sample Landlord (Demo)", agency: null, type: "LANDLORD" as const, areas: ["model-town", "johar-town"] },
];

type Tier = 1 | 2 | 3; // 1 premium, 2 upper-mid, 3 mid
const AREA_PLAN: { slug: string | string[]; tier: Tier; types: string[] }[] = [
  { slug: ["dha-phase-5", "dha-phase-6", "dha-phase-3", "dha-phase-8", "dha-phase-4", "dha-phase-9-town", "dha-phase-7", "dha-phase-1"], tier: 1,
    types: ["house", "house", "house", "house", "house", "upper-portion", "lower-portion", "apartment", "penthouse", "office", "office", "shop", "showroom", "flat"] },
  { slug: "bahria-town", tier: 2, types: ["house", "house", "house", "apartment", "flat", "upper-portion", "shop"] },
  { slug: ["gulberg-3", "gulberg-2", "gulberg"], tier: 1, types: ["office", "office", "office", "apartment", "apartment", "flat", "penthouse", "shop", "house", "commercial-building"] },
  { slug: "johar-town", tier: 2, types: ["house", "house", "upper-portion", "lower-portion", "flat", "room", "room", "office", "shop"] },
  { slug: "model-town", tier: 2, types: ["house", "house", "lower-portion", "office"] },
  { slug: "wapda-town", tier: 3, types: ["house", "upper-portion", "lower-portion"] },
  { slug: "askari", tier: 2, types: ["apartment", "apartment", "house"] },
  { slug: "valencia-town", tier: 2, types: ["house", "upper-portion", "house"] },
  { slug: "lake-city", tier: 2, types: ["house", "lower-portion", "house"] },
  { slug: "faisal-town", tier: 3, types: ["house", "office", "upper-portion"] },
  { slug: "garden-town", tier: 2, types: ["house", "flat", "office"] },
  { slug: "township", tier: 3, types: ["house", "shop", "lower-portion"] },
  { slug: "allama-iqbal-town", tier: 3, types: ["house", "flat", "shop", "room"] },
  { slug: "lda-avenue", tier: 3, types: ["house", "upper-portion", "house"] },
  { slug: "bahria-orchard", tier: 3, types: ["house", "house", "lower-portion"] },
  { slug: "central-park", tier: 3, types: ["house", "upper-portion", "house"] },
  { slug: "pia-housing-society", tier: 3, types: ["house", "upper-portion", "room"] },
  { slug: "jubilee-town", tier: 3, types: ["house", "lower-portion", "house"] },
  { slug: "fazaia-housing-scheme", tier: 3, types: ["house", "upper-portion", "house"] },
  { slug: "cantt", tier: 1, types: ["house", "apartment", "office"] },
  { slug: "raiwind-road", tier: 3, types: ["warehouse", "warehouse", "factory", "farm-house", "industrial-space"] },
  { slug: "bedian-road", tier: 2, types: ["farm-house", "farm-house", "warehouse", "industrial-building"] },
];

const RES_AMENITIES = ["parking", "electricity", "gas", "water", "security", "servant-quarter", "store-room", "balcony", "garden", "terrace", "generator", "basement"];
const APT_AMENITIES = ["parking", "electricity", "gas", "water", "security", "elevator", "generator", "central-ac", "gym", "swimming-pool", "balcony"];
const COM_AMENITIES = ["parking", "electricity", "water", "security", "elevator", "generator", "central-ac", "basement"];
const IND_AMENITIES = ["parking", "electricity", "water", "security", "generator"];

const RES_FEATURES = [
  "Separate electricity and gas meters", "Tiled flooring", "Near park", "Near mosque", "Wide road access",
  "Walking distance to commercial area", "Fitted kitchen", "Wardrobes in bedrooms", "Car porch", "Solar backup ready",
  "Close to schools", "Family-friendly street", "Good natural light", "Recently painted",
];
const COM_FEATURES = [
  "Open floor plan", "Reception area", "Dedicated washrooms", "Backup power", "Fibre internet available",
  "Visible signage space", "Close to main boulevard", "Ample customer parking", "24/7 access",
];
const IND_FEATURES = ["Three-phase electricity", "Heavy vehicle access", "Covered shed", "Guard room", "Office block on site", "Wide gate"];

const IMG = (scene: string, n: number) => `/demo/photos/${scene}-${n}.webp`;

type Built = {
  typeSlug: string;
  area: number;
  areaUnit: AreaUnit;
  bedrooms: number | null;
  bathrooms: number | null;
  monthlyRent: number;
  furnished: FurnishedStatus | null;
  condition: PropertyCondition | null;
  floor: number | null;
  mainRoad: boolean;
  corner: boolean;
  frontFt: number | null;
  loadingArea: boolean;
  ceilingHeightFt: number | null;
  amenities: string[];
  features: string[];
  scenes: string[];
};

function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  return out;
}

function build(typeSlug: string, tier: Tier): Built {
  const mult = tier === 1 ? 1.35 : tier === 2 ? 1 : 0.72;
  const cond = pick<PropertyCondition>(["BRAND_NEW", "RENOVATED", "USED", "USED"]);
  const base: Built = {
    typeSlug, area: 0, areaUnit: "MARLA", bedrooms: null, bathrooms: null, monthlyRent: 0, furnished: null, condition: cond,
    floor: null, mainRoad: false, corner: false, frontFt: null, loadingArea: false, ceilingHeightFt: null,
    amenities: [], features: [], scenes: [],
  };
  switch (typeSlug) {
    case "house": {
      const size = pick([5, 5, 7, 8, 10, 10, 12, 20, 20, 40]);
      const kanal = size >= 20;
      const beds = size <= 5 ? 3 : size <= 8 ? between(3, 4) : size <= 12 ? between(4, 5) : size === 20 ? between(5, 6) : between(6, 7);
      return {
        ...base, area: kanal ? size / 20 : size, areaUnit: kanal ? "KANAL" : "MARLA", bedrooms: beds, bathrooms: beds + between(0, 1),
        monthlyRent: roundTo(size * 9000 * mult * (0.85 + rand() * 0.3), 5000),
        furnished: pick<FurnishedStatus>(["UNFURNISHED", "UNFURNISHED", "UNFURNISHED", "SEMI_FURNISHED", "FURNISHED"]),
        corner: chance(0.2), amenities: sample(RES_AMENITIES, between(4, 8)), features: sample(RES_FEATURES, between(3, 5)),
        scenes: ["house", "living", "bedroom", "kitchen"],
      };
    }
    case "upper-portion":
    case "lower-portion": {
      const size = pick([5, 7, 10, 10, 12, 20]);
      const kanal = size >= 20;
      const beds = size <= 7 ? 2 : between(2, 3);
      return {
        ...base, area: kanal ? 1 : size, areaUnit: kanal ? "KANAL" : "MARLA", bedrooms: beds, bathrooms: beds,
        monthlyRent: roundTo(size * 5200 * mult * (0.85 + rand() * 0.3), 2500),
        furnished: pick<FurnishedStatus>(["UNFURNISHED", "UNFURNISHED", "SEMI_FURNISHED"]),
        floor: typeSlug === "upper-portion" ? 1 : 0,
        amenities: sample(["electricity", "gas", "water", "parking", "security", "store-room", "terrace"], between(3, 5)),
        features: [...sample(RES_FEATURES, between(2, 4)), "Separate entrance"],
        scenes: ["house", "living", "bedroom", "kitchen"],
      };
    }
    case "flat": {
      const sqft = roundTo(between(650, 1450), 25);
      const beds = sqft < 850 ? 1 : sqft < 1150 ? 2 : 3;
      return {
        ...base, area: sqft, areaUnit: "SQFT", bedrooms: beds, bathrooms: Math.max(1, beds - between(0, 1)),
        monthlyRent: roundTo(sqft * 42 * mult * (0.85 + rand() * 0.3), 2500),
        furnished: pick<FurnishedStatus>(["UNFURNISHED", "SEMI_FURNISHED", "FURNISHED"]), floor: between(1, 4),
        amenities: sample(["electricity", "gas", "water", "security", "parking", "balcony"], between(3, 5)), features: sample(RES_FEATURES, 3),
        scenes: ["apartment", "living", "bedroom", "kitchen"],
      };
    }
    case "apartment": {
      const sqft = roundTo(between(900, 2600), 50);
      const beds = sqft < 1200 ? 2 : sqft < 1900 ? 3 : 4;
      return {
        ...base, area: sqft, areaUnit: "SQFT", bedrooms: beds, bathrooms: beds,
        monthlyRent: roundTo(sqft * 70 * mult * (0.85 + rand() * 0.3), 5000),
        furnished: pick<FurnishedStatus>(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]), floor: between(1, 12),
        amenities: sample(APT_AMENITIES, between(5, 9)), features: sample(RES_FEATURES, 3),
        scenes: ["apartment", "living", "bedroom", "kitchen"],
      };
    }
    case "penthouse": {
      const sqft = roundTo(between(2800, 4500), 100);
      return {
        ...base, area: sqft, areaUnit: "SQFT", bedrooms: between(3, 4), bathrooms: between(4, 5),
        monthlyRent: roundTo(sqft * 110 * mult * (0.9 + rand() * 0.2), 10000),
        furnished: pick<FurnishedStatus>(["FURNISHED", "SEMI_FURNISHED"]), floor: between(10, 18), condition: "BRAND_NEW",
        amenities: sample(APT_AMENITIES, 9).concat("terrace"), features: ["Private terrace", "City views", ...sample(RES_FEATURES, 2)],
        scenes: ["apartment", "living", "bedroom", "kitchen"],
      };
    }
    case "room": {
      const sqft = roundTo(between(140, 260), 10);
      return {
        ...base, area: sqft, areaUnit: "SQFT", bedrooms: 1, bathrooms: 1,
        monthlyRent: roundTo(between(12000, 28000) * (mult > 1 ? 1.2 : 1), 1000),
        furnished: pick<FurnishedStatus>(["FURNISHED", "SEMI_FURNISHED"]), floor: between(0, 2),
        amenities: ["electricity", "gas", "water"], features: ["Attached bathroom", "Suitable for students or working professionals", "Shared kitchen access"],
        scenes: ["bedroom", "living"],
      };
    }
    case "farm-house": {
      const kanal = pick([4, 6, 8, 10, 16]);
      return {
        ...base, area: kanal, areaUnit: "KANAL", bedrooms: between(4, 6), bathrooms: between(4, 6),
        monthlyRent: roundTo(kanal * 45000 * (0.85 + rand() * 0.3), 10000), furnished: pick<FurnishedStatus>(["FURNISHED", "SEMI_FURNISHED"]),
        amenities: ["parking", "electricity", "water", "security", "garden", "swimming-pool", "generator", "servant-quarter"],
        features: ["Large lawn", "Boundary wall", "Fruit trees", "Suitable for families"], scenes: ["farmhouse", "living", "bedroom"],
      };
    }
    case "office": {
      const sqft = roundTo(between(450, 5000), 50);
      return {
        ...base, area: sqft, areaUnit: "SQFT", bedrooms: null, bathrooms: between(1, 4),
        monthlyRent: roundTo(sqft * 120 * mult * (0.85 + rand() * 0.3), 5000),
        furnished: pick<FurnishedStatus>(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]), floor: between(0, 8),
        mainRoad: chance(0.5), corner: chance(0.2), amenities: sample(COM_AMENITIES, between(4, 7)), features: sample(COM_FEATURES, 4),
        scenes: ["office", "office", "living"],
      };
    }
    case "shop": {
      const sqft = roundTo(between(150, 900), 25);
      return {
        ...base, area: sqft, areaUnit: "SQFT", bedrooms: null, bathrooms: chance(0.5) ? 1 : null,
        monthlyRent: roundTo(sqft * 240 * mult * (0.85 + rand() * 0.3), 5000), floor: pick([0, 0, 0, 1, -1]),
        mainRoad: chance(0.55), corner: chance(0.3), frontFt: between(10, 30),
        amenities: sample(["electricity", "water", "security", "parking"], between(2, 4)), features: sample(COM_FEATURES, 3),
        scenes: ["shop", "shop"],
      };
    }
    case "showroom": {
      const sqft = roundTo(between(1500, 4000), 100);
      return {
        ...base, area: sqft, areaUnit: "SQFT", bathrooms: 2, monthlyRent: roundTo(sqft * 260 * mult * (0.9 + rand() * 0.2), 10000),
        floor: 0, mainRoad: true, corner: chance(0.5), frontFt: between(30, 60),
        amenities: ["parking", "electricity", "water", "security", "central-ac", "generator"], features: ["Glass frontage", "Double-height ceiling", ...sample(COM_FEATURES, 2)],
        scenes: ["shop", "office"],
      };
    }
    case "warehouse":
    case "industrial-space": {
      const sqft = roundTo(between(5000, 30000), 500);
      return {
        ...base, area: sqft, areaUnit: "SQFT", bathrooms: between(1, 3), monthlyRent: roundTo(sqft * between(28, 45), 10000),
        floor: 0, mainRoad: chance(0.5), loadingArea: true, ceilingHeightFt: between(18, 35), frontFt: between(40, 120),
        amenities: IND_AMENITIES, features: sample(IND_FEATURES, 4), scenes: ["warehouse", "warehouse"], condition: pick<PropertyCondition>(["USED", "RENOVATED"]),
      };
    }
    case "factory":
    case "industrial-building": {
      const kanal = pick([2, 4, 6, 8]);
      return {
        ...base, area: kanal, areaUnit: "KANAL", bathrooms: between(2, 6), monthlyRent: roundTo(kanal * 4500 * between(30, 45), 10000),
        floor: 0, mainRoad: chance(0.4), loadingArea: true, ceilingHeightFt: between(20, 40), frontFt: between(60, 150),
        amenities: IND_AMENITIES, features: sample(IND_FEATURES, 4), scenes: ["warehouse", "office"], condition: "USED",
      };
    }
    case "commercial-building": {
      const sqft = roundTo(between(6000, 20000), 500);
      return {
        ...base, area: sqft, areaUnit: "SQFT", bathrooms: between(6, 14), monthlyRent: roundTo(sqft * 150 * mult, 50000),
        floor: 0, mainRoad: true, corner: chance(0.5), frontFt: between(40, 80),
        amenities: COM_AMENITIES, features: ["Multiple floors", "Separate entrance", ...sample(COM_FEATURES, 3)], scenes: ["office", "office", "shop"],
      };
    }
    default:
      throw new Error(`Unknown type ${typeSlug}`);
  }
}

function describe(b: Built, typeName: string, locationName: string, society: string | null, rent: number, deposit: number): string {
  const where = society ? `${society}, ${locationName}` : locationName;
  const sizeText = b.areaUnit === "SQFT" ? `${b.area.toLocaleString("en-US")} sq ft` : `${b.area} ${b.areaUnit === "MARLA" ? "Marla" : "Kanal"}`;
  const body: string[] = [`${sizeText} ${typeName.toLowerCase()} available for rent in ${where}, Lahore.`];
  if (b.bedrooms) body.push(`It has ${b.bedrooms} bedroom${b.bedrooms > 1 ? "s" : ""}${b.bathrooms ? ` and ${b.bathrooms} bathroom${b.bathrooms > 1 ? "s" : ""}` : ""}.`);
  if (b.furnished === "FURNISHED") body.push("The property is offered fully furnished.");
  if (b.furnished === "SEMI_FURNISHED") body.push("It is semi-furnished with wardrobes, fans and light fittings in place.");
  if (b.mainRoad) body.push("Located on a main road with good visibility.");
  if (b.loadingArea) body.push(`Loading area for trucks${b.ceilingHeightFt ? ` and a clear height of about ${b.ceilingHeightFt} ft` : ""}.`);
  if (b.features.length) body.push(`Highlights: ${b.features.slice(0, 3).join(", ").toLowerCase()}.`);
  return [
    "DEMO LISTING — this sample record was created to test the RentNest Lahore platform. It is not a real property and is not available for rent.",
    body.join(" "),
    `Monthly rent is PKR ${rent.toLocaleString("en-US")} with a security deposit of PKR ${deposit.toLocaleString("en-US")}.`,
  ].join("\n\n");
}

async function seedDemo() {
  const types = new Map((await prisma.propertyType.findMany()).map((t) => [t.slug, t]));
  const amenities = new Map((await prisma.amenity.findMany()).map((a) => [a.slug, a]));
  const locations = new Map((await prisma.location.findMany()).map((l) => [l.slug, l]));

  // Demo agents
  const agentBySlug = new Map<string, { id: string; areas: string[] }>();
  for (const [i, a] of DEMO_AGENTS.entries()) {
    const slug = slugify(a.name);
    const phone = `+9200000000${String(i + 1).padStart(2, "0")}`; // intentionally invalid placeholder
    const agent = await prisma.agent.upsert({
      where: { slug },
      create: {
        slug, name: a.name, agency: a.agency, type: a.type, phone, whatsapp: phone, isDemo: true, verified: i % 2 === 0,
        about: `${a.name} is a DEMO profile created to test RentNest Lahore. It does not represent a real agency or person, and its phone number is a non-working placeholder.`,
        areasServed: { connect: a.areas.filter((s) => locations.has(s)).map((s) => ({ slug: s })) },
      },
      update: {},
    });
    agentBySlug.set(slug, { id: agent.id, areas: a.areas });
  }
  const agentFor = (locSlug: string, parentSlug?: string) => {
    for (const a of agentBySlug.values()) if (a.areas.includes(locSlug) || (parentSlug && a.areas.includes(parentSlug))) return a.id;
    return [...agentBySlug.values()][0].id;
  };

  const existingDemo = await prisma.property.count({ where: { isDemo: true } });
  if (existingDemo > 0) {
    console.log(`Demo: ${existingDemo} demo listings already present — skipping (run db:remove-demo first to regenerate)`);
    return;
  }

  const usedSlugs = new Set((await prisma.property.findMany({ select: { slug: true } })).map((p) => p.slug));
  const now = Date.now();
  let count = 0;
  let featuredCount = 0;

  for (const plan of AREA_PLAN) {
    const slugs = Array.isArray(plan.slug) ? plan.slug : [plan.slug];
    for (const [i, typeSlug] of plan.types.entries()) {
      const locSlug = slugs[i % slugs.length];
      const loc = locations.get(locSlug);
      const type = types.get(typeSlug);
      if (!loc || !type) throw new Error(`Missing ${locSlug} / ${typeSlug}`);
      const parent = loc.parentId ? [...locations.values()].find((l) => l.id === loc.parentId) : undefined;
      const b = build(typeSlug, plan.tier);
      const society = chance(0.7) ? `${pick(["Block", "Block", "Sector"])} ${pick("ABCDEFGHJKLM".split(""))}` : null;
      const title = generateTitle({ typeName: type.name, typeSlug, area: b.area, areaUnit: b.areaUnit, bedrooms: b.bedrooms, locationName: loc.name });
      const baseSlug = titleToSlug(title);
      let slug = baseSlug;
      for (let n = 2; usedSlugs.has(slug); n++) slug = `${baseSlug}-${n}`;
      usedSlugs.add(slug);

      const daysAgo = between(0, 55);
      const publishedAt = new Date(now - daysAgo * 86_400_000 - between(0, 20) * 3_600_000);
      // A few non-published records to exercise moderation & lifecycle
      const roll = count % 23;
      const status: PropertyStatus = roll === 7 ? "RENTED" : roll === 13 ? "PENDING_REVIEW" : roll === 17 ? "EXPIRED" : roll === 19 ? "DRAFT" : roll === 21 ? "REJECTED" : "PUBLISHED";
      const featured = status === "PUBLISHED" && featuredCount < 10 && chance(0.18);
      if (featured) featuredCount++;
      const deposit = b.monthlyRent * pick([1, 2, 2, 3]);
      const jitter = () => (rand() - 0.5) * 0.012;
      const n1 = between(1, 6);
      const images = b.scenes.map((scene, idx) => ({
        url: IMG(scene, ((n1 + idx) % 6) + 1),
        alt: `${title} — ${["front view", "living area", "bedroom", "kitchen"][idx] ?? "interior"} (sample photo)`,
        width: 1200, height: 900, position: idx,
      }));

      await prisma.property.create({
        data: {
          title, slug, purpose: "RENT", propertyTypeId: type.id,
          price: b.monthlyRent, priceFrequency: "MONTHLY", monthlyRent: b.monthlyRent,
          securityDeposit: deposit, advanceMonths: pick([1, 1, 2]),
          area: b.area, areaUnit: b.areaUnit, areaSqft: toSqft(b.area, b.areaUnit),
          bedrooms: b.bedrooms, bathrooms: b.bathrooms, locationId: loc.id, society,
          address: society ? `${society}, ${loc.name}` : loc.name,
          latitude: loc.latitude != null ? loc.latitude + jitter() : null,
          longitude: loc.longitude != null ? loc.longitude + jitter() : null,
          description: describe(b, type.name, loc.name, society, b.monthlyRent, deposit),
          features: b.features, furnished: b.furnished, condition: b.condition, floor: b.floor,
          mainRoad: b.mainRoad, corner: b.corner, frontFt: b.frontFt, loadingArea: b.loadingArea, ceilingHeightFt: b.ceilingHeightFt,
          agentId: agentFor(locSlug, parent?.slug), status, featured, verified: chance(0.3), isDemo: true,
          rejectionReason: status === "REJECTED" ? "Demo: photos do not match the description." : null,
          publishedAt: status === "DRAFT" || status === "PENDING_REVIEW" || status === "REJECTED" ? null : publishedAt,
          expiresAt: status === "EXPIRED" ? new Date(now - 86_400_000) : new Date(publishedAt.getTime() + 90 * 86_400_000),
          rentedAt: status === "RENTED" ? new Date(now - 2 * 86_400_000) : null,
          createdAt: publishedAt,
          amenities: { connect: b.amenities.filter((s) => amenities.has(s)).map((s) => ({ slug: s })) },
          images: { create: images },
        },
      });
      count++;
    }
  }
  console.log(`Demo: created ${DEMO_AGENTS.length} demo agents and ${count} demo listings (${featuredCount} featured)`);
}

async function main() {
  await seedTaxonomy();
  await seedAdmin();
  if (WITH_DEMO) await seedDemo();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
