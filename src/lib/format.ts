import type { AreaUnit, FurnishedStatus, PriceFrequency, PropertyCondition, PropertyStatus } from "@prisma/client";

const nf = new Intl.NumberFormat("en-US");

export function formatNumber(n: number): string {
  return nf.format(n);
}

/** "PKR 85,000" */
export function formatPKR(amount: number): string {
  return `PKR ${nf.format(Math.round(amount))}`;
}

/** Compact Pakistani notation: 85 Thousand, 1.5 Lakh, 2.1 Crore */
export function formatPKRCompact(amount: number): string {
  const trim = (v: number) => (Math.round(v * 100) / 100).toString();
  if (amount >= 10_000_000) return `${trim(amount / 10_000_000)} Crore`;
  if (amount >= 100_000) return `${trim(amount / 100_000)} Lakh`;
  if (amount >= 1_000) return `${trim(amount / 1_000)} Thousand`;
  return nf.format(amount);
}

export const FREQUENCY_LABEL: Record<PriceFrequency, string> = {
  MONTHLY: "month",
  QUARTERLY: "quarter",
  YEARLY: "year",
};

export function formatRent(price: number, frequency: PriceFrequency = "MONTHLY"): string {
  return `${formatPKR(price)} / ${FREQUENCY_LABEL[frequency]}`;
}

export const AREA_UNIT_LABEL: Record<AreaUnit, string> = {
  MARLA: "Marla",
  KANAL: "Kanal",
  SQFT: "Sq. Ft.",
  SQYD: "Sq. Yd.",
};

export function formatArea(area: number, unit: AreaUnit): string {
  const v = Number.isInteger(area) ? area.toString() : area.toFixed(1).replace(/\.0$/, "");
  if (unit === "KANAL" || unit === "MARLA") {
    return `${v} ${AREA_UNIT_LABEL[unit]}`;
  }
  return `${nf.format(Number(v))} ${AREA_UNIT_LABEL[unit]}`;
}

export const FURNISHED_LABEL: Record<FurnishedStatus, string> = {
  FURNISHED: "Furnished",
  SEMI_FURNISHED: "Semi Furnished",
  UNFURNISHED: "Unfurnished",
};

export const CONDITION_LABEL: Record<PropertyCondition, string> = {
  BRAND_NEW: "Brand New",
  RENOVATED: "Renovated",
  USED: "Used",
};

export const STATUS_LABEL: Record<PropertyStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  PUBLISHED: "Published",
  EXPIRED: "Expired",
  RENTED: "Rented",
  REJECTED: "Rejected",
};

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Karachi" });
}

/** "Posted 3 days ago" style relative label. */
export function timeAgo(d: Date | string, now = new Date()): string {
  const diff = Math.max(0, now.getTime() - new Date(d).getTime());
  const day = 86_400_000;
  if (diff < 3_600_000) return "just now";
  if (diff < day) return `${Math.floor(diff / 3_600_000)} hours ago`;
  const days = Math.floor(diff / day);
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  return formatDate(d);
}

export function propertyRef(refNo: number): string {
  return `RN-${refNo}`;
}
