"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { revalidateListing } from "@/lib/property-write";
import { RESERVED_RENT_SEGMENTS, TAXONOMY_TAG } from "@/lib/taxonomy";
import { firstErrors, normalizePhone, phoneSchema } from "@/lib/validation";
import { importCsv } from "@/lib/csv-import";
import type { FormState } from "./auth";

const DEFAULT_LISTING_DAYS = 90;

// ---------------------------------------------------------------- moderation

export async function moderateProperty(
  id: string,
  action: "approve" | "reject" | "unpublish" | "feature" | "unfeature" | "verify" | "unverify" | "expire" | "rented",
  reason?: string,
): Promise<FormState> {
  await requireAdmin();
  const p = await prisma.property.findUnique({ where: { id }, select: { slug: true, publishedAt: true, expiresAt: true, images: { select: { id: true }, take: 1 } } });
  if (!p) return { message: "Listing not found" };
  const now = new Date();
  switch (action) {
    case "approve":
      await prisma.property.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          rejectionReason: null,
          publishedAt: p.publishedAt ?? now,
          expiresAt: !p.expiresAt || p.expiresAt < now ? new Date(now.getTime() + DEFAULT_LISTING_DAYS * 86_400_000) : undefined,
        },
      });
      break;
    case "reject":
      await prisma.property.update({ where: { id }, data: { status: "REJECTED", rejectionReason: (reason || "Did not meet listing guidelines").slice(0, 300), featured: false } });
      break;
    case "unpublish":
      await prisma.property.update({ where: { id }, data: { status: "DRAFT" } });
      break;
    case "expire":
      await prisma.property.update({ where: { id }, data: { status: "EXPIRED", featured: false } });
      break;
    case "rented":
      await prisma.property.update({ where: { id }, data: { status: "RENTED", rentedAt: now, featured: false } });
      break;
    case "feature":
    case "unfeature":
      await prisma.property.update({ where: { id }, data: { featured: action === "feature" } });
      break;
    case "verify":
    case "unverify":
      await prisma.property.update({ where: { id }, data: { verified: action === "verify" } });
      break;
  }
  revalidateListing(p.slug);
  revalidatePath("/admin/properties/");
  return { ok: true, message: "Updated." };
}

// ---------------------------------------------------------------- locations

const locationSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(80).optional(),
  parentId: z.string().optional(),
  description: z.string().trim().max(3000).optional(),
  latitude: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().min(30.9).max(32.1).optional()),
  longitude: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().min(73.8).max(74.9).optional()),
  isPopular: z.preprocess((v) => v === "on", z.boolean()),
  active: z.preprocess((v) => v === "on", z.boolean()),
  sortOrder: z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().int()),
});

export async function saveLocation(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = locationSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { errors: firstErrors(parsed.error), message: "Please check the fields." };
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);
  const typeSlugs = new Set((await prisma.propertyType.findMany({ select: { pluralSlug: true, slug: true } })).flatMap((t) => [t.pluralSlug, t.slug]));
  if (RESERVED_RENT_SEGMENTS.has(slug) || typeSlugs.has(slug)) return { errors: { slug: "This slug is reserved for a property type URL" } };
  const clash = await prisma.location.findUnique({ where: { slug } });
  if (clash && clash.id !== d.id) return { errors: { slug: "Slug already in use" } };
  if (d.parentId && d.parentId === d.id) return { errors: { parentId: "A location cannot be its own parent" } };
  const data = {
    name: d.name, slug, parentId: d.parentId || null, description: d.description || null,
    latitude: d.latitude ?? null, longitude: d.longitude ?? null, isPopular: d.isPopular, active: d.active, sortOrder: d.sortOrder,
  };
  if (d.id) await prisma.location.update({ where: { id: d.id }, data });
  else await prisma.location.create({ data });
  updateTag(TAXONOMY_TAG);
  revalidatePath("/admin/locations/");
  revalidatePath("/areas/");
  return { ok: true, message: d.id ? "Location updated." : "Location added." };
}

// ---------------------------------------------------------------- property types

const typeSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(60),
  pluralName: z.string().trim().min(2).max(60),
  pluralSlug: z.string().trim().max(60).optional(),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
  description: z.string().trim().max(3000).optional(),
  active: z.preprocess((v) => v === "on", z.boolean()),
  sortOrder: z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().int()),
});

export async function savePropertyType(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = typeSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { errors: firstErrors(parsed.error), message: "Please check the fields." };
  const d = parsed.data;
  const pluralSlug = slugify(d.pluralSlug || d.pluralName);
  const slug = slugify(d.name);
  if (RESERVED_RENT_SEGMENTS.has(pluralSlug)) return { errors: { pluralSlug: "This URL segment is reserved" } };
  if (await prisma.location.findUnique({ where: { slug: pluralSlug } })) return { errors: { pluralSlug: "A location already uses this slug" } };
  const clash = await prisma.propertyType.findFirst({ where: { OR: [{ slug }, { pluralSlug }, { name: d.name }], NOT: d.id ? { id: d.id } : undefined } });
  if (clash) return { message: "A property type with this name or slug already exists." };
  const data = { name: d.name, slug, pluralName: d.pluralName, pluralSlug, category: d.category, description: d.description || null, active: d.active, sortOrder: d.sortOrder };
  if (d.id) await prisma.propertyType.update({ where: { id: d.id }, data });
  else await prisma.propertyType.create({ data });
  updateTag(TAXONOMY_TAG);
  revalidatePath("/admin/property-types/");
  return { ok: true, message: "Saved." };
}

// ---------------------------------------------------------------- amenities

export async function saveAmenity(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const group = String(formData.get("group") ?? "general");
  if (name.length < 2 || name.length > 60) return { errors: { name: "Enter a name (2–60 characters)" } };
  const slug = slugify(name);
  if (await prisma.amenity.findFirst({ where: { OR: [{ slug }, { name }] } })) return { errors: { name: "Amenity already exists" } };
  await prisma.amenity.create({ data: { name, slug, group: ["general", "utilities", "commercial"].includes(group) ? group : "general", sortOrder: 100 } });
  updateTag(TAXONOMY_TAG);
  revalidatePath("/admin/amenities/");
  return { ok: true, message: "Amenity added." };
}

export async function deleteAmenity(id: string): Promise<FormState> {
  await requireAdmin();
  await prisma.amenity.delete({ where: { id } });
  updateTag(TAXONOMY_TAG);
  revalidatePath("/admin/amenities/");
  return { ok: true };
}

// ---------------------------------------------------------------- agents

const agentSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(100),
  agency: z.string().trim().max(120).optional(),
  type: z.enum(["AGENT", "LANDLORD"]),
  phone: phoneSchema,
  whatsapp: z.union([phoneSchema, z.literal("").transform(() => undefined)]).optional(),
  email: z.union([z.string().trim().email(), z.literal("").transform(() => undefined)]).optional(),
  about: z.string().trim().max(3000).optional(),
  imageUrl: z.union([z.string().trim().url().max(500), z.literal("").transform(() => undefined)]).optional(),
  verified: z.preprocess((v) => v === "on", z.boolean()),
});

export async function saveAgent(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = agentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { errors: firstErrors(parsed.error), message: "Please check the fields." };
  const d = parsed.data;
  const areaIds = formData.getAll("areaIds").map(String);
  const data = {
    name: d.name, agency: d.agency || null, type: d.type, phone: normalizePhone(d.phone),
    whatsapp: d.whatsapp ? normalizePhone(d.whatsapp) : normalizePhone(d.phone), email: d.email ?? null,
    about: d.about || null, imageUrl: d.imageUrl ?? null, verified: d.verified,
    areasServed: { set: areaIds.map((id) => ({ id })) },
  };
  let slug: string;
  if (d.id) {
    const a = await prisma.agent.update({ where: { id: d.id }, data });
    slug = a.slug;
  } else {
    const base = slugify(d.name) || "agent";
    slug = base;
    for (let n = 2; await prisma.agent.findUnique({ where: { slug }, select: { id: true } }); n++) slug = `${base}-${n}`;
    await prisma.agent.create({ data: { ...data, slug, areasServed: { connect: areaIds.map((id) => ({ id })) } } });
  }
  revalidatePath(`/agents/${slug}/`);
  revalidatePath("/admin/agents/");
  if (!d.id) redirect("/admin/agents/");
  return { ok: true, message: "Agent saved." };
}

// ---------------------------------------------------------------- users

export async function updateUserAdmin(userId: string, patch: { role?: "USER" | "AGENT" | "ADMIN"; disabled?: boolean }): Promise<FormState> {
  const admin = await requireAdmin();
  if (userId === admin.id) return { message: "You cannot change your own role or status." };
  await prisma.user.update({ where: { id: userId }, data: patch });
  if (patch.disabled) await prisma.session.deleteMany({ where: { userId } });
  revalidatePath("/admin/users/");
  return { ok: true };
}

// ---------------------------------------------------------------- reports & enquiries

export async function setReportStatus(id: string, status: "OPEN" | "RESOLVED" | "DISMISSED"): Promise<FormState> {
  await requireAdmin();
  await prisma.report.update({ where: { id }, data: { status } });
  revalidatePath("/admin/reports/");
  return { ok: true };
}

// ---------------------------------------------------------------- CSV import

export async function runCsvImport(_: FormState & { report?: unknown }, formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { message: "Choose a CSV file." };
  if (file.size > 5 * 1024 * 1024) return { message: "CSV is larger than 5 MB. Split it into smaller files." };
  const dryRun = formData.get("mode") !== "import";
  const report = await importCsv(await file.text(), { dryRun, markDemo: formData.get("demo") === "on" });
  if (!dryRun && report.imported > 0) revalidateListing();
  return {
    ok: report.errors.length === 0,
    message: dryRun
      ? `Validation finished: ${report.valid} valid row(s), ${report.errors.length} row(s) with errors. Nothing was imported yet.`
      : `Imported ${report.imported} listing(s). ${report.errors.length} row(s) skipped.`,
    report,
  };
}
