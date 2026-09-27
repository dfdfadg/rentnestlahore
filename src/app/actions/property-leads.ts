"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { emailSchema, firstErrors, normalizePhone, phoneSchema } from "@/lib/validation";
import type { FormState } from "./auth";

const optInt = z.preprocess((v) => (v === "" || v == null ? undefined : Number(String(v).replace(/,/g, ""))), z.number().int().min(0).max(100_000_000_000).optional());

const schema = z.object({
  intent: z.enum(["BUY", "SELL"], { message: "Choose buy or sell" }),
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: phoneSchema,
  email: z.union([emailSchema, z.literal("").transform(() => undefined)]).optional(),
  propertyType: z.string().trim().max(60).optional(),
  area: z.string().trim().min(2, "Enter the area").max(200),
  size: z.string().trim().max(60).optional(),
  budgetMin: optInt,
  budgetMax: optInt,
  timeline: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(1500).optional(),
  consent: z.literal("on", { message: "Please agree to share your details with our partner consultant" }),
});

/** Buy/sell consultation request — stored as a lead for the admin to forward to the partner consultant. */
export async function submitPropertyLead(_: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("company")) return { ok: true, message: "Thank you!" }; // honeypot
  if (!(await rateLimit("property-lead", 3, 60 * 60_000))) return { message: "Too many requests. Please try again later." };
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { errors: firstErrors(parsed.error) };
  const d = parsed.data;
  const phone = normalizePhone(d.phone);
  const recent = await prisma.propertyLead.findFirst({ where: { phone, intent: d.intent, createdAt: { gt: new Date(Date.now() - 86_400_000) } }, select: { id: true } });
  if (recent) return { ok: true, message: "We already have your request from today. A consultant will contact you soon." };
  await prisma.propertyLead.create({
    data: {
      intent: d.intent, name: d.name, phone, email: d.email, propertyType: d.propertyType || null, area: d.area,
      size: d.size || null, budgetMin: d.budgetMin ?? null, budgetMax: d.budgetMax ?? null, timeline: d.timeline || null, notes: d.notes || null,
    },
  });
  revalidatePath("/admin/property-leads/");
  return { ok: true, message: "Shukriya! A property consultant will call or WhatsApp you shortly." };
}

export async function setPropertyLeadStatus(id: string, status: "NEW" | "FORWARDED" | "CONVERTED" | "CLOSED" | "SPAM"): Promise<FormState> {
  await requireAdmin();
  if (!["NEW", "FORWARDED", "CONVERTED", "CLOSED", "SPAM"].includes(status)) return { message: "Invalid status" };
  await prisma.propertyLead.update({
    where: { id },
    data: { status, ...(status === "FORWARDED" ? { forwardedAt: new Date() } : {}) },
  });
  revalidatePath("/admin/property-leads/");
  return { ok: true };
}
