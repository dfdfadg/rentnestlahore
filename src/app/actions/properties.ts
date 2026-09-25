"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireUser, type CurrentUser } from "@/lib/auth";
import { needsEmailVerification } from "@/lib/email-verification";
import { canEditProperty } from "@/lib/permissions";
import { rateLimit } from "@/lib/rate-limit";
import { deleteStoredImage } from "@/lib/storage";
import { firstErrors, normalizePhone, phoneSchema, propertyFormSchema } from "@/lib/validation";
import { allSlugsFor, buildTitleAndSlug, changeSlug, containsSaleLanguage, monthlyFrom, revalidateListing, slugify, uniqueSlug } from "@/lib/property-write";
import type { FormState } from "./auth";

const DEFAULT_LISTING_DAYS = 90;

async function ensureOwnAgent(user: CurrentUser, phone: string, whatsapp?: string | null) {
  const existing = await prisma.agent.findUnique({ where: { userId: user.id } });
  if (existing) {
    if (existing.phone !== phone || (whatsapp && existing.whatsapp !== whatsapp)) {
      return prisma.agent.update({ where: { id: existing.id }, data: { phone, whatsapp: whatsapp || phone } });
    }
    return existing;
  }
  const base = slugify(user.name) || "landlord";
  let slug = base;
  for (let n = 2; await prisma.agent.findUnique({ where: { slug }, select: { id: true } }); n++) slug = `${base}-${n}`;
  return prisma.agent.create({
    data: { slug, name: user.name, type: "LANDLORD", phone, whatsapp: whatsapp || phone, email: user.email, userId: user.id },
  });
}

/** Create or update a rental listing. Regular users' listings always go through moderation. */
export async function saveProperty(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Please log in again." };
  if (needsEmailVerification(user)) return { message: "Please verify your email address before posting a property." };
  const isAdmin = user.role === "ADMIN";
  const id = String(formData.get("id") ?? "") || null;

  const raw = Object.fromEntries(formData.entries());
  const parsed = propertyFormSchema.safeParse({ ...raw, amenityIds: formData.getAll("amenityIds").map(String) });
  if (!parsed.success) return { errors: firstErrors(parsed.error), message: "Please fix the highlighted fields." };
  const d = parsed.data;

  if (containsSaleLanguage(d.title, d.description)) {
    return { message: "RentNest Lahore is for rental properties only. Please remove any sale / buy wording.", errors: { description: "Sale wording is not allowed" } };
  }

  let existing: Awaited<ReturnType<typeof canEditProperty>> = null;
  if (id) {
    existing = await canEditProperty(user, id);
    if (!existing) return { message: "You do not have permission to edit this listing." };
  } else if (!(await rateLimit("create-listing", 10, 24 * 3_600_000, user.id))) {
    return { message: "You have created many listings today. Please try again tomorrow." };
  }

  // Resolve the agent/landlord who owns the listing
  let agentId: string;
  if (isAdmin) {
    if (!d.agentId) return { errors: { agentId: "Select an agent or landlord" } };
    const agent = await prisma.agent.findUnique({ where: { id: d.agentId }, select: { id: true } });
    if (!agent) return { errors: { agentId: "Agent not found" } };
    agentId = agent.id;
  } else {
    const phone = phoneSchema.safeParse(formData.get("contactPhone"));
    if (!phone.success) return { errors: { contactPhone: phone.error.issues[0].message } };
    const wa = String(formData.get("contactWhatsapp") ?? "").trim();
    const waParsed = wa ? phoneSchema.safeParse(wa) : null;
    if (waParsed && !waParsed.success) return { errors: { contactWhatsapp: waParsed.error.issues[0].message } };
    const agent = await ensureOwnAgent(user, normalizePhone(phone.data), waParsed?.success ? normalizePhone(waParsed.data) : null);
    agentId = agent.id;
  }

  let meta;
  try {
    meta = await buildTitleAndSlug({ ...d, excludeId: id ?? undefined });
  } catch (e) {
    return { message: (e as Error).message };
  }
  const amenities = await prisma.amenity.findMany({ where: { id: { in: d.amenityIds } }, select: { id: true } });
  const features = (d.features ?? "")
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((s) => s.slice(0, 80));

  const data = {
    title: meta.title,
    purpose: "RENT" as const,
    propertyTypeId: d.propertyTypeId,
    price: d.price,
    priceFrequency: d.priceFrequency,
    monthlyRent: monthlyFrom(d.price, d.priceFrequency),
    securityDeposit: d.securityDeposit ?? null,
    advanceMonths: d.advanceMonths ?? null,
    area: d.area,
    areaUnit: d.areaUnit,
    areaSqft: meta.areaSqft,
    bedrooms: d.bedrooms ?? null,
    bathrooms: d.bathrooms ?? null,
    locationId: d.locationId,
    society: d.society ?? null,
    address: d.address ?? null,
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    description: d.description,
    features,
    furnished: d.furnished ?? null,
    condition: d.condition ?? null,
    floor: d.floor ?? null,
    mainRoad: d.mainRoad,
    corner: d.corner,
    frontFt: d.frontFt ?? null,
    loadingArea: d.loadingArea,
    ceilingHeightFt: d.ceilingHeightFt ?? null,
    videoUrl: d.videoUrl ?? null,
    agentId,
  };

  const now = new Date();
  const adminFields = isAdmin
    ? {
        featured: d.featured,
        verified: d.verified,
        rejectionReason: d.status === "REJECTED" ? d.rejectionReason ?? "Did not meet listing guidelines" : null,
        expiresAt: d.expiresAt ? new Date(`${d.expiresAt}T23:59:59+05:00`) : undefined,
      }
    : {};

  if (!id) {
    // Duplicate protection
    const dup = await prisma.property.findFirst({
      where: {
        agentId, propertyTypeId: d.propertyTypeId, locationId: d.locationId, price: d.price, areaSqft: meta.areaSqft,
        status: { in: ["DRAFT", "PENDING_REVIEW", "PUBLISHED"] }, createdAt: { gt: new Date(Date.now() - 30 * 86_400_000) },
      },
      select: { id: true },
    });
    if (dup) return { message: "This looks like a duplicate of a listing you already have. Please edit the existing listing instead." };

    const status = isAdmin ? d.status ?? "DRAFT" : "DRAFT";
    const slug = await uniqueSlug(meta.baseSlug);
    const created = await prisma.property.create({
      data: {
        ...data,
        ...adminFields,
        slug,
        status,
        publishedAt: status === "PUBLISHED" ? now : null,
        expiresAt: adminFields.expiresAt ?? (status === "PUBLISHED" ? new Date(now.getTime() + DEFAULT_LISTING_DAYS * 86_400_000) : null),
        amenities: { connect: amenities },
      },
    });
    // Always refresh: a previously deleted listing may have used this slug (cached page or 404).
    revalidateListing(slug);
    redirect(isAdmin ? `/admin/properties/${created.id}/photos/` : `/my-properties/${created.id}/photos/?new=1`);
  }

  // Update
  const current = await prisma.property.findUniqueOrThrow({ where: { id: id! }, select: { slug: true, status: true, publishedAt: true, title: true, expiresAt: true } });
  let slug = current.slug;
  if (meta.title !== current.title) {
    slug = await uniqueSlug(meta.baseSlug, id!);
    await changeSlug(id!, current.slug, slug, current.publishedAt != null);
  }
  let status = current.status;
  let message = "Listing saved.";
  if (isAdmin && d.status) status = d.status;
  if (!isAdmin && (current.status === "PUBLISHED" || current.status === "REJECTED")) {
    status = "PENDING_REVIEW";
    message = "Changes saved and sent for review. Your listing will be live again once approved.";
  }
  const publishing = status === "PUBLISHED" && current.status !== "PUBLISHED";
  await prisma.property.update({
    where: { id: id! },
    data: {
      ...data,
      ...adminFields,
      slug,
      status,
      publishedAt: publishing ? current.publishedAt ?? now : undefined,
      expiresAt:
        adminFields.expiresAt ??
        (publishing && (!current.expiresAt || current.expiresAt < now) ? new Date(now.getTime() + DEFAULT_LISTING_DAYS * 86_400_000) : undefined),
      rentedAt: status === "RENTED" && current.status !== "RENTED" ? now : undefined,
      amenities: { set: amenities },
    },
  });
  revalidateListing(await allSlugsFor(id!));
  return { ok: true, message };
}

export async function submitForReview(propertyId: string): Promise<FormState> {
  const user = await requireUser();
  if (needsEmailVerification(user)) return { message: "Please verify your email address before submitting a listing." };
  const p = await canEditProperty(user, propertyId);
  if (!p) return { message: "Not allowed." };
  const images = await prisma.propertyImage.count({ where: { propertyId } });
  if (images === 0) return { message: "Please add at least one photo before submitting your listing." };
  if (!["DRAFT", "REJECTED", "EXPIRED"].includes(p.status)) return { message: "This listing is already submitted." };
  await prisma.property.update({ where: { id: propertyId }, data: { status: "PENDING_REVIEW", rejectionReason: null } });
  revalidateListing(await allSlugsFor(propertyId));
  return { ok: true, message: "Submitted for review. We'll publish it once it has been checked." };
}

export async function markRented(propertyId: string): Promise<FormState> {
  const user = await requireUser();
  const p = await canEditProperty(user, propertyId);
  if (!p) return { message: "Not allowed." };
  await prisma.property.update({ where: { id: propertyId }, data: { status: "RENTED", rentedAt: new Date(), featured: false } });
  revalidateListing(await allSlugsFor(propertyId));
  return { ok: true, message: "Marked as rented. It has been removed from search results." };
}

export async function deleteProperty(propertyId: string): Promise<FormState> {
  const user = await requireUser();
  const p = await canEditProperty(user, propertyId);
  if (!p) return { message: "Not allowed." };
  const images = await prisma.propertyImage.findMany({ where: { propertyId }, select: { url: true } });
  const slugs = await allSlugsFor(propertyId);
  await prisma.property.delete({ where: { id: propertyId } });
  await Promise.all(images.map((i) => deleteStoredImage(i.url)));
  revalidateListing(slugs);
  return { ok: true, message: "Listing deleted." };
}

// ---- image management ------------------------------------------------------

async function imageOwnerCheck(imageId: string) {
  const user = await getCurrentUser();
  const img = await prisma.propertyImage.findUnique({ where: { id: imageId }, select: { id: true, url: true, propertyId: true } });
  if (!img) return null;
  const p = await canEditProperty(user, img.propertyId);
  return p ? { img, property: p } : null;
}

export async function reorderImages(propertyId: string, orderedIds: string[]): Promise<FormState> {
  const user = await getCurrentUser();
  const p = await canEditProperty(user, propertyId);
  if (!p) return { message: "Not allowed." };
  const imgs = await prisma.propertyImage.findMany({ where: { propertyId }, select: { id: true } });
  const valid = new Set(imgs.map((i) => i.id));
  if (orderedIds.length !== valid.size || !orderedIds.every((i) => valid.has(i))) return { message: "Invalid image order." };
  await prisma.$transaction(orderedIds.map((imgId, position) => prisma.propertyImage.update({ where: { id: imgId }, data: { position } })));
  if (p.status === "PUBLISHED") revalidateListing(p.slug);
  return { ok: true };
}

export async function updateImageAlt(imageId: string, alt: string): Promise<FormState> {
  const found = await imageOwnerCheck(imageId);
  if (!found) return { message: "Not allowed." };
  await prisma.propertyImage.update({ where: { id: imageId }, data: { alt: alt.trim().slice(0, 160) } });
  if (found.property.status === "PUBLISHED") revalidateListing(found.property.slug);
  return { ok: true };
}

export async function deleteImage(imageId: string): Promise<FormState> {
  const found = await imageOwnerCheck(imageId);
  if (!found) return { message: "Not allowed." };
  await prisma.propertyImage.delete({ where: { id: imageId } });
  const rest = await prisma.propertyImage.findMany({ where: { propertyId: found.img.propertyId }, orderBy: { position: "asc" }, select: { id: true } });
  await prisma.$transaction(rest.map((r, position) => prisma.propertyImage.update({ where: { id: r.id }, data: { position } })));
  await deleteStoredImage(found.img.url);
  if (found.property.status === "PUBLISHED") revalidateListing(found.property.slug);
  return { ok: true };
}
