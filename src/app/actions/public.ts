"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { activeWhere } from "@/lib/properties";
import { enquirySchema, firstErrors, normalizePhone, reportSchema } from "@/lib/validation";
import type { FormState } from "./auth";

export async function submitEnquiry(_: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("company")) return { ok: true, message: "Thank you — your enquiry has been sent." }; // honeypot
  if (!(await rateLimit("enquiry", 6, 10 * 60_000))) {
    return { message: "You've sent several enquiries in a short time. Please wait a few minutes and try again." };
  }
  const parsed = enquirySchema.safeParse({
    propertyId: formData.get("propertyId"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    message: formData.get("message"),
    preferredContact: formData.get("preferredContact") || "CALL",
  });
  if (!parsed.success) return { errors: firstErrors(parsed.error) };
  const d = parsed.data;
  const property = await prisma.property.findFirst({ where: { AND: [{ id: d.propertyId }, activeWhere()] }, select: { id: true, agentId: true } });
  if (!property) return { message: "This listing is no longer available." };
  // Duplicate protection: same phone + same property within 24h
  const recent = await prisma.enquiry.findFirst({
    where: { propertyId: property.id, phone: normalizePhone(d.phone), createdAt: { gt: new Date(Date.now() - 86_400_000) } },
    select: { id: true },
  });
  if (recent) return { ok: true, message: "We already have your enquiry for this property — the landlord/agent will be in touch." };
  const user = await getCurrentUser();
  await prisma.enquiry.create({
    data: {
      propertyId: property.id,
      agentId: property.agentId,
      userId: user?.id,
      name: d.name,
      phone: normalizePhone(d.phone),
      email: d.email,
      message: d.message,
      preferredContact: d.preferredContact,
    },
  });
  return { ok: true, message: "Thank you — your enquiry has been sent to the landlord/agent." };
}

export async function submitReport(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await rateLimit("report", 5, 60 * 60_000))) return { message: "Too many reports. Please try again later." };
  const parsed = reportSchema.safeParse({
    propertyId: formData.get("propertyId"),
    reason: formData.get("reason"),
    details: formData.get("details") || undefined,
    email: formData.get("email") ?? "",
  });
  if (!parsed.success) return { errors: firstErrors(parsed.error) };
  const exists = await prisma.property.findUnique({ where: { id: parsed.data.propertyId }, select: { id: true } });
  if (!exists) return { message: "Listing not found." };
  const user = await getCurrentUser();
  await prisma.report.create({ data: { ...parsed.data, userId: user?.id } });
  return { ok: true, message: "Thanks for letting us know. Our team will review this listing." };
}
