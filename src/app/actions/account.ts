"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser, hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { firstErrors, normalizePhone, passwordSchema, phoneSchema } from "@/lib/validation";
import type { FormState } from "./auth";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.union([phoneSchema, z.literal("").transform(() => undefined)]).optional(),
  agency: z.string().trim().max(120).optional(),
  about: z.string().trim().max(2000).optional(),
  whatsapp: z.union([phoneSchema, z.literal("").transform(() => undefined)]).optional(),
});

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/profile/");
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    agency: formData.get("agency") ?? undefined,
    about: formData.get("about") ?? undefined,
    whatsapp: formData.get("whatsapp") ?? "",
  });
  if (!parsed.success) return { errors: firstErrors(parsed.error) };
  const d = parsed.data;
  const phone = d.phone ? normalizePhone(d.phone) : null;
  await prisma.user.update({ where: { id: user.id }, data: { name: d.name, phone } });
  const agent = await prisma.agent.findUnique({ where: { userId: user.id } });
  if (agent) {
    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        name: d.name,
        agency: d.agency || null,
        about: d.about || null,
        ...(phone ? { phone } : {}),
        whatsapp: d.whatsapp ? normalizePhone(d.whatsapp) : phone ?? agent.whatsapp,
      },
    });
    revalidatePath(`/agents/${agent.slug}/`);
  }
  return { ok: true, message: "Profile updated." };
}

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/profile/");
  const record = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(String(formData.get("currentPassword") ?? ""), record.passwordHash))) {
    return { errors: { currentPassword: "Current password is incorrect" } };
  }
  const pw = passwordSchema.safeParse(formData.get("newPassword"));
  if (!pw.success) return { errors: { newPassword: pw.error.issues[0].message } };
  if (formData.get("newPassword") !== formData.get("confirmPassword")) return { errors: { confirmPassword: "Passwords do not match" } };
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(pw.data) } });
  return { ok: true, message: "Password changed." };
}

/** Agents/landlords can update the status of enquiries on their own listings. */
export async function setEnquiryStatus(enquiryId: string, status: "NEW" | "CONTACTED" | "CLOSED" | "SPAM"): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Login required" };
  const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId }, select: { agent: { select: { userId: true } } } });
  if (!enquiry) return { message: "Not found" };
  if (user.role !== "ADMIN" && enquiry.agent?.userId !== user.id) return { message: "Not allowed" };
  if (!["NEW", "CONTACTED", "CLOSED", "SPAM"].includes(status)) return { message: "Invalid status" };
  await prisma.enquiry.update({ where: { id: enquiryId }, data: { status } });
  revalidatePath("/my-enquiries/");
  revalidatePath("/admin/enquiries/");
  return { ok: true };
}
