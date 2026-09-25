import { z } from "zod";

/** Pakistani phone numbers: 03XXXXXXXXX, +923XXXXXXXXX, landlines like 042XXXXXXXX. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .refine((v) => /^(\+92|0092|0)\d{9,11}$/.test(v), "Enter a valid Pakistani phone number, e.g. 0300 1234567");

/** Normalise to +92 international format for tel: / wa.me links. */
export function normalizePhone(v: string): string {
  const d = v.replace(/[^\d+]/g, "");
  if (d.startsWith("+92")) return d;
  if (d.startsWith("0092")) return `+92${d.slice(4)}`;
  if (d.startsWith("92") && d.length >= 11) return `+${d}`;
  if (d.startsWith("0")) return `+92${d.slice(1)}`;
  return d;
}

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address").max(160);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Use at least one letter and one number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: emailSchema,
  phone: z.union([phoneSchema, z.literal("").transform(() => undefined)]).optional(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(128),
});

export const enquirySchema = z.object({
  propertyId: z.string().min(1).max(40),
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: phoneSchema,
  email: z.union([emailSchema, z.literal("").transform(() => undefined)]).optional(),
  message: z.string().trim().min(10, "Please write a short message (at least 10 characters)").max(2000),
  preferredContact: z.enum(["CALL", "WHATSAPP", "EMAIL"]).default("CALL"),
});

export const reportSchema = z.object({
  propertyId: z.string().min(1).max(40),
  reason: z.enum(["already-rented", "wrong-information", "fake-listing", "wrong-price", "duplicate", "scam", "other"]),
  details: z.string().trim().max(1000).optional(),
  email: z.union([emailSchema, z.literal("").transform(() => undefined)]).optional(),
});

export const REPORT_REASONS: Record<z.infer<typeof reportSchema>["reason"], string> = {
  "already-rented": "Property is already rented",
  "wrong-information": "Incorrect details",
  "wrong-price": "Wrong rent / price",
  "fake-listing": "Fake or misleading listing",
  duplicate: "Duplicate listing",
  scam: "Suspected scam",
  other: "Something else",
};

const optInt = (min: number, max: number) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().min(min).max(max).optional());
const optNum = (min: number, max: number) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().min(min).max(max).optional());
const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === "1" || v === true, z.boolean());
const optStr = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().max(max).optional());

export const propertyFormSchema = z.object({
  title: optStr(120),
  propertyTypeId: z.string().min(1, "Select a property type"),
  price: z.preprocess((v) => Number(String(v ?? "").replace(/,/g, "")), z.number({ message: "Enter the rent" }).int().min(1000, "Rent must be at least PKR 1,000").max(100_000_000)),
  priceFrequency: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).default("MONTHLY"),
  securityDeposit: optInt(0, 1_000_000_000),
  advanceMonths: optInt(0, 24),
  area: z.preprocess((v) => Number(v), z.number({ message: "Enter the area" }).positive("Enter the area").max(1_000_000)),
  areaUnit: z.enum(["MARLA", "KANAL", "SQFT", "SQYD"]),
  bedrooms: optInt(0, 30),
  bathrooms: optInt(0, 30),
  locationId: z.string().min(1, "Select an area"),
  society: optStr(120),
  address: optStr(200),
  latitude: optNum(30.9, 32.1),
  longitude: optNum(73.8, 74.9),
  description: z.string().trim().min(40, "Description should be at least 40 characters").max(8000),
  features: optStr(1000),
  furnished: z.preprocess((v) => (v === "" ? undefined : v), z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional()),
  condition: z.preprocess((v) => (v === "" ? undefined : v), z.enum(["BRAND_NEW", "RENOVATED", "USED"]).optional()),
  floor: optInt(-2, 150),
  mainRoad: checkbox,
  corner: checkbox,
  frontFt: optNum(0, 2000),
  loadingArea: checkbox,
  ceilingHeightFt: optNum(0, 200),
  videoUrl: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().url("Enter a valid URL").max(300).refine((u) => /^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(u), "Only YouTube or Vimeo links are supported").optional(),
  ),
  amenityIds: z.array(z.string()).max(40).default([]),
  // admin-only fields (ignored for regular users)
  agentId: optStr(40),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "EXPIRED", "RENTED", "REJECTED"]).optional(),
  featured: checkbox,
  verified: checkbox,
  expiresAt: optStr(20),
  rejectionReason: optStr(300),
});

export type PropertyFormInput = z.infer<typeof propertyFormSchema>;

export function firstErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
