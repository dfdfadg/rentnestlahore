/**
 * CSV import for authorised rental listings.
 *
 * Columns (header row required):
 *   title, property_type, price, price_frequency, area, area_unit, bedrooms, bathrooms,
 *   location, society, address, description, agent_name, agent_phone, whatsapp, images,
 *   latitude, longitude, featured, verified, status
 * Optional extra columns: furnished, condition, amenities (pipe-separated slugs), security_deposit
 *
 * `images` is a pipe-separated list of https URLs you are authorised to use.
 * Rows are validated first; nothing is written in dry-run mode.
 */
import Papa from "papaparse";
import type { AreaUnit, FurnishedStatus, PriceFrequency, PropertyCondition, PropertyStatus, PrismaClient } from "@prisma/client";
import { toSqft } from "./area";
import { generateTitle, slugify, titleToSlug } from "./slug";
import { normalizePhone } from "./validation";
import { containsSaleLanguage, monthlyFrom } from "./rent-rules";

export type ImportReport = {
  total: number;
  valid: number;
  imported: number;
  errors: { row: number; messages: string[] }[];
  preview: { row: number; title: string; status: string }[];
  /** Slugs of rows imported directly as PUBLISHED (for search-engine notification). */
  publishedSlugs: string[];
};

const PHONE_RE = /^(\+92|0092|0)\d{9,11}$/;
const bool = (v?: string) => /^(1|true|yes|y)$/i.test((v ?? "").trim());
const num = (v?: string) => {
  const s = (v ?? "").replace(/,/g, "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

const UNIT: Record<string, AreaUnit> = { marla: "MARLA", kanal: "KANAL", sqft: "SQFT", "sq ft": "SQFT", sqyd: "SQYD", "sq yd": "SQYD" };
const FREQ: Record<string, PriceFrequency> = { monthly: "MONTHLY", month: "MONTHLY", quarterly: "QUARTERLY", yearly: "YEARLY", annual: "YEARLY", year: "YEARLY" };
const FURN: Record<string, FurnishedStatus> = { furnished: "FURNISHED", "semi furnished": "SEMI_FURNISHED", "semi-furnished": "SEMI_FURNISHED", unfurnished: "UNFURNISHED" };
const COND: Record<string, PropertyCondition> = { "brand new": "BRAND_NEW", new: "BRAND_NEW", renovated: "RENOVATED", used: "USED" };
const STATUS: Record<string, PropertyStatus> = { draft: "DRAFT", pending: "PENDING_REVIEW", pending_review: "PENDING_REVIEW", published: "PUBLISHED" };

let prismaSingleton: PrismaClient | null = null;
async function db(): Promise<PrismaClient> {
  if (!prismaSingleton) prismaSingleton = (await import("./db")).prisma;
  return prismaSingleton;
}

export async function importCsv(csv: string, opts: { dryRun: boolean; markDemo?: boolean; prisma?: PrismaClient }): Promise<ImportReport> {
  const prisma = opts.prisma ?? (await db());
  const parsed = Papa.parse<Record<string, string>>(csv.replace(/^﻿/, ""), {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });
  const report: ImportReport = { total: parsed.data.length, valid: 0, imported: 0, errors: [], preview: [], publishedSlugs: [] };
  if (parsed.errors.length) {
    for (const e of parsed.errors.slice(0, 20)) report.errors.push({ row: (e.row ?? 0) + 2, messages: [`CSV format: ${e.message}`] });
  }
  if (report.total > 2000) {
    report.errors.push({ row: 0, messages: ["Maximum 2,000 rows per import."] });
    return report;
  }
  const [types, locations, amenities] = await Promise.all([
    prisma.propertyType.findMany({ where: { active: true } }),
    prisma.location.findMany({ where: { active: true } }),
    prisma.amenity.findMany(),
  ]);
  const findType = (v: string) => {
    const s = v.trim().toLowerCase();
    return types.find((t) => [t.slug, t.pluralSlug, t.name.toLowerCase(), t.pluralName.toLowerCase()].includes(s) || t.slug === slugify(s));
  };
  const findLoc = (v: string) => {
    const s = v.trim().toLowerCase();
    return locations.find((l) => l.slug === s || l.name.toLowerCase() === s || l.slug === slugify(s));
  };
  const seen = new Set<string>();

  for (const [i, r] of parsed.data.entries()) {
    const rowNo = i + 2; // header is row 1
    const msgs: string[] = [];
    const type = findType(r.property_type ?? "");
    if (!type) msgs.push(`Unknown property_type "${r.property_type ?? ""}"`);
    const loc = findLoc(r.location ?? "");
    if (!loc) msgs.push(`Unknown location "${r.location ?? ""}" (add it in Admin → Locations first)`);
    const price = num(r.price);
    if (!price || Number.isNaN(price) || price < 1000) msgs.push("price must be a number ≥ 1,000");
    const freq = FREQ[(r.price_frequency ?? "monthly").trim().toLowerCase() || "monthly"];
    if (!freq) msgs.push("price_frequency must be monthly, quarterly or yearly");
    const area = num(r.area);
    if (!area || Number.isNaN(area) || area <= 0) msgs.push("area must be a positive number");
    const unit = UNIT[(r.area_unit ?? "").trim().toLowerCase()];
    if (!unit) msgs.push("area_unit must be marla, kanal, sqft or sqyd");
    const beds = num(r.bedrooms);
    const baths = num(r.bathrooms);
    if (Number.isNaN(beds) || Number.isNaN(baths)) msgs.push("bedrooms/bathrooms must be numbers");
    const description = (r.description ?? "").trim();
    if (description.length < 40) msgs.push("description must be at least 40 characters");
    if (containsSaleLanguage(r.title, description)) msgs.push("sale / buy wording is not allowed — rentals only");
    const phoneRaw = (r.agent_phone ?? "").replace(/[\s()-]/g, "");
    if (!PHONE_RE.test(phoneRaw)) msgs.push("agent_phone must be a valid Pakistani number");
    const waRaw = (r.whatsapp ?? "").replace(/[\s()-]/g, "");
    if (waRaw && !PHONE_RE.test(waRaw)) msgs.push("whatsapp must be a valid Pakistani number");
    if (!(r.agent_name ?? "").trim()) msgs.push("agent_name is required");
    const lat = num(r.latitude);
    const lng = num(r.longitude);
    if ((lat != null && (Number.isNaN(lat) || lat < 30.9 || lat > 32.1)) || (lng != null && (Number.isNaN(lng) || lng < 73.8 || lng > 74.9))) {
      msgs.push("latitude/longitude must be inside the Lahore area");
    }
    const images = (r.images ?? "").split("|").map((s) => s.trim()).filter(Boolean);
    const badImg = images.find((u) => !/^https:\/\/[^\s"'<>]+$/i.test(u));
    if (badImg) msgs.push(`image URL must be https: ${badImg.slice(0, 60)}`);
    if (images.length > 20) msgs.push("maximum 20 images per listing");
    let status = STATUS[(r.status ?? "pending_review").trim().toLowerCase() || "pending_review"];
    if (!status) msgs.push("status must be draft, pending_review or published");
    if (status === "PUBLISHED" && images.length === 0) status = "PENDING_REVIEW"; // never publish without photos
    const furnished = r.furnished ? FURN[r.furnished.trim().toLowerCase()] : undefined;
    const condition = r.condition ? COND[r.condition.trim().toLowerCase()] : undefined;
    const deposit = num(r.security_deposit);

    if (msgs.length || !type || !loc || !unit || !price || !area || !freq) {
      report.errors.push({ row: rowNo, messages: msgs });
      continue;
    }
    const areaSqft = toSqft(area, unit);
    const phone = normalizePhone(phoneRaw);
    const key = `${phone}|${type.id}|${loc.id}|${price}|${areaSqft}`;
    if (seen.has(key)) {
      report.errors.push({ row: rowNo, messages: ["duplicate of an earlier row in this file"] });
      continue;
    }
    seen.add(key);
    const existingAgent = await prisma.agent.findFirst({ where: { phone } });
    if (existingAgent) {
      const dup = await prisma.property.findFirst({
        where: { agentId: existingAgent.id, propertyTypeId: type.id, locationId: loc.id, price, areaSqft, status: { in: ["DRAFT", "PENDING_REVIEW", "PUBLISHED"] } },
        select: { id: true },
      });
      if (dup) {
        report.errors.push({ row: rowNo, messages: ["a matching listing already exists (duplicate)"] });
        continue;
      }
    }
    const title =
      (r.title ?? "").trim().slice(0, 120) ||
      generateTitle({ typeName: type.name, typeSlug: type.slug, area, areaUnit: unit, bedrooms: beds ?? null, locationName: loc.name });
    report.valid++;
    report.preview.push({ row: rowNo, title, status });
    if (opts.dryRun) continue;

    const agent =
      existingAgent ??
      (await (async () => {
        const base = slugify(r.agent_name) || "agent";
        let slug = base;
        for (let n = 2; await prisma.agent.findUnique({ where: { slug }, select: { id: true } }); n++) slug = `${base}-${n}`;
        return prisma.agent.create({
          data: { slug, name: r.agent_name.trim().slice(0, 100), phone, whatsapp: waRaw ? normalizePhone(waRaw) : phone, type: "AGENT", isDemo: !!opts.markDemo },
        });
      })());
    const baseSlug = titleToSlug(title);
    let slug = baseSlug;
    for (let n = 2; (await prisma.property.findUnique({ where: { slug }, select: { id: true } })) || (await prisma.slugRedirect.findUnique({ where: { oldSlug: slug } })); n++) slug = `${baseSlug}-${n}`;
    const now = new Date();
    const amenitySlugs = (r.amenities ?? "").split("|").map((s) => slugify(s)).filter(Boolean);
    await prisma.property.create({
      data: {
        title, slug, purpose: "RENT", propertyTypeId: type.id,
        price, priceFrequency: freq, monthlyRent: monthlyFrom(price, freq),
        securityDeposit: deposit && !Number.isNaN(deposit) ? Math.round(deposit) : null,
        area, areaUnit: unit, areaSqft, bedrooms: beds ?? null, bathrooms: baths ?? null,
        locationId: loc.id, society: (r.society ?? "").trim() || null, address: (r.address ?? "").trim() || null,
        latitude: lat ?? null, longitude: lng ?? null, description, features: [],
        furnished: furnished ?? null, condition: condition ?? null,
        agentId: agent.id, status, featured: bool(r.featured), verified: bool(r.verified), isDemo: !!opts.markDemo,
        publishedAt: status === "PUBLISHED" ? now : null,
        expiresAt: status === "PUBLISHED" ? new Date(now.getTime() + 90 * 86_400_000) : null,
        amenities: { connect: amenities.filter((a) => amenitySlugs.includes(a.slug)).map((a) => ({ id: a.id })) },
        images: { create: images.map((url, position) => ({ url, position, alt: `${title} — photo ${position + 1}` })) },
      },
    });
    report.imported++;
    if (status === "PUBLISHED") report.publishedSlugs.push(slug);
  }
  return report;
}

export const CSV_TEMPLATE_HEADER =
  "title,property_type,price,price_frequency,area,area_unit,bedrooms,bathrooms,location,society,address,description,agent_name,agent_phone,whatsapp,images,latitude,longitude,featured,verified,status";
