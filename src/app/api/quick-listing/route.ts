import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request-guard";
import { normalizePhone, phoneSchema } from "@/lib/validation";
import { containsSaleLanguage, monthlyFrom } from "@/lib/rent-rules";
import { buildTitleAndSlug, uniqueSlug } from "@/lib/property-write";
import { formatArea } from "@/lib/format";
import { slugify } from "@/lib/slug";
import { processImage, storeImage } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_PHOTOS = 8;

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: phoneSchema,
  whatsapp: z.union([phoneSchema, z.literal("").transform(() => undefined)]).optional(),
  propertyTypeId: z.string().min(1, "Select a property type"),
  locationId: z.string().min(1, "Select an area"),
  society: z.string().trim().max(120).optional(),
  price: z.preprocess((v) => Number(String(v ?? "").replace(/,/g, "")), z.number({ message: "Enter the monthly rent" }).int().min(1000, "Rent must be at least PKR 1,000").max(100_000_000)),
  area: z.preprocess((v) => Number(v), z.number({ message: "Enter the size" }).positive("Enter the size").max(1_000_000)),
  areaUnit: z.enum(["MARLA", "KANAL", "SQFT", "SQYD"]),
  bedrooms: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().min(0).max(30).optional()),
  bathrooms: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().min(0).max(30).optional()),
  description: z.string().trim().max(3000).optional(),
  consent: z.literal("on", { message: "Please confirm you are the owner or authorised to rent this property" }),
});

/**
 * Account-free "list your property" submission. The listing is always created as
 * PENDING_REVIEW (source=quick_form) and only goes live after an admin approves it.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await rateLimit("quick-listing", 3, 60 * 60_000))) {
    return NextResponse.json({ error: "You have submitted several listings recently. Please try again in an hour, or contact us on WhatsApp." }, { status: 429 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Upload failed. Please try again with fewer or smaller photos." }, { status: 400 });
  }
  if (form.get("company")) return NextResponse.json({ ok: true, refNo: 0 }); // honeypot

  const raw: Record<string, unknown> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") raw[k] = v;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0] ?? "_")] ??= i.message;
    return NextResponse.json({ error: "Please fix the highlighted fields.", errors }, { status: 400 });
  }
  const d = parsed.data;
  if (containsSaleLanguage(d.description)) {
    return NextResponse.json({ error: "RentNest Lahore is for rental properties only. Please remove any sale / buy wording.", errors: { description: "Sale wording is not allowed" } }, { status: 400 });
  }

  let meta;
  try {
    meta = await buildTitleAndSlug({ propertyTypeId: d.propertyTypeId, locationId: d.locationId, area: d.area, areaUnit: d.areaUnit, bedrooms: d.bedrooms });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  const phone = normalizePhone(d.phone);
  // Reuse an anonymous landlord profile with the same number; never attach to a registered account.
  const agent =
    (await prisma.agent.findFirst({ where: { phone, userId: null, isDemo: false } })) ??
    (await (async () => {
      const base = slugify(d.name) || "landlord";
      let slug = base;
      for (let n = 2; await prisma.agent.findUnique({ where: { slug }, select: { id: true } }); n++) slug = `${base}-${n}`;
      return prisma.agent.create({
        data: { slug, name: d.name, type: "LANDLORD", phone, whatsapp: d.whatsapp ? normalizePhone(d.whatsapp) : phone },
      });
    })());

  const dup = await prisma.property.findFirst({
    where: {
      agentId: agent.id, propertyTypeId: d.propertyTypeId, locationId: d.locationId, price: d.price, areaSqft: meta.areaSqft,
      status: { in: ["DRAFT", "PENDING_REVIEW", "PUBLISHED"] }, createdAt: { gt: new Date(Date.now() - 30 * 86_400_000) },
    },
    select: { refNo: true },
  });
  if (dup) return NextResponse.json({ error: `We already have this property (RN-${dup.refNo}). Our team will contact you soon.` }, { status: 409 });

  // Short or missing descriptions are completed from the structured details (never invented).
  const facts = [
    `${formatArea(d.area, d.areaUnit)} ${meta.type.name.toLowerCase()} available for rent in ${d.society ? `${d.society}, ` : ""}${meta.loc.name}, Lahore.`,
    d.bedrooms ? `${d.bedrooms} bedroom${d.bedrooms > 1 ? "s" : ""}${d.bathrooms ? `, ${d.bathrooms} bathroom${d.bathrooms > 1 ? "s" : ""}` : ""}.` : "",
    `Monthly rent PKR ${d.price.toLocaleString("en-US")}.`,
  ].filter(Boolean).join(" ");
  const description = d.description && d.description.length >= 40 ? d.description : [d.description, facts].filter(Boolean).join("\n\n");

  const slug = await uniqueSlug(meta.baseSlug);
  const property = await prisma.property.create({
    data: {
      title: meta.title, slug, purpose: "RENT", propertyTypeId: d.propertyTypeId,
      price: d.price, priceFrequency: "MONTHLY", monthlyRent: monthlyFrom(d.price, "MONTHLY"),
      area: d.area, areaUnit: d.areaUnit, areaSqft: meta.areaSqft, bedrooms: d.bedrooms ?? null, bathrooms: d.bathrooms ?? null,
      locationId: d.locationId, society: d.society || null, description, features: [],
      agentId: agent.id, status: "PENDING_REVIEW", source: "quick_form",
    },
  });

  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0).slice(0, MAX_PHOTOS);
  const photoErrors: string[] = [];
  let position = 0;
  for (const file of files) {
    try {
      const { data, width, height } = await processImage(Buffer.from(await file.arrayBuffer()));
      const url = await storeImage(data, property.id);
      await prisma.propertyImage.create({ data: { propertyId: property.id, url, width, height, position: position++, alt: `${meta.title} — photo ${position}` } });
    } catch (e) {
      photoErrors.push(`${file.name}: ${(e as Error).message}`);
    }
  }
  return NextResponse.json({ ok: true, refNo: property.refNo, photos: position, photoErrors });
}
