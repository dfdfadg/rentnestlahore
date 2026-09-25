import type { AreaUnit } from "@prisma/client";

/**
 * Area conversions used for filtering/sorting.
 * Lahore housing societies (DHA, Bahria etc.) conventionally use 1 Marla = 225 sq ft,
 * and 1 Kanal = 20 Marla = 4,500 sq ft.
 */
export const SQFT_PER_UNIT: Record<AreaUnit, number> = {
  MARLA: 225,
  KANAL: 4500,
  SQFT: 1,
  SQYD: 9,
};

export function toSqft(value: number, unit: AreaUnit): number {
  return Math.round(value * SQFT_PER_UNIT[unit] * 100) / 100;
}

export function fromSqft(sqft: number, unit: AreaUnit): number {
  return sqft / SQFT_PER_UNIT[unit];
}

export const AREA_UNITS: AreaUnit[] = ["MARLA", "KANAL", "SQFT", "SQYD"];
