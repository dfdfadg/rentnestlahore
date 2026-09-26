"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { emailSchema, firstErrors, normalizePhone, phoneSchema } from "@/lib/validation";
import type { FormState } from "./auth";

const optInt = z.preprocess((v) => (v === "" || v == null ? undefined : Number(String(v).replace(/,/g, ""))), z.number().int().min(0).max(1_000_000_000).optional());

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: phoneSchema,
  email: z.union([emailSchema, z.literal("").transform(() => undefined)]).optional(),
  propertyType: z.string().trim().max(60).optional(),
  areas: z.string().trim().min(2, "Which areas are you looking in?").max(300),
  budgetMin: optInt,
  budgetMax: optInt,
  bedrooms: optInt,
  moveIn: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(1500).optional(),
});

/** "I'm looking for a rental" lead form. Leads are reviewed by the admin and shared with matching landlords/agents. */
export async function submitRequirement(_: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("company")) return { ok: true, message: "Thank you!" }; // honeypot
  if (!(await rateLimit("requirement", 3, 60 * 60_000))) return { message: "Too many requests. Please try again later." };
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { errors: firstErrors(parsed.error) };
  const d = parsed.data;
  const phone = normalizePhone(d.phone);
  const recent = await prisma.rentRequirement.findFirst({ where: { phone, createdAt: { gt: new Date(Date.now() - 86_400_000) } }, select: { id: true } });
  if (recent) return { ok: true, message: "We already have your requirement from today — our team will be in touch." };
  await prisma.rentRequirement.create({
    data: {
      name: d.name, phone, email: d.email, propertyType: d.propertyType || null, areas: d.areas,
      budgetMin: d.budgetMin ?? null, budgetMax: d.budgetMax ?? null, bedrooms: d.bedrooms ?? null,
      moveIn: d.moveIn || null, notes: d.notes || null,
    },
  });
  revalidatePath("/admin/requirements/");
  return { ok: true, message: "Shukriya! We've received your requirement. We'll share it with landlords and agents and contact you when we find matching rentals." };
}

export async function setRequirementStatus(id: string, status: "NEW" | "CONTACTED" | "MATCHED" | "CLOSED" | "SPAM"): Promise<FormState> {
  await requireAdmin();
  if (!["NEW", "CONTACTED", "MATCHED", "CLOSED", "SPAM"].includes(status)) return { message: "Invalid status" };
  await prisma.rentRequirement.update({ where: { id }, data: { status } });
  revalidatePath("/admin/requirements/");
  return { ok: true };
}
