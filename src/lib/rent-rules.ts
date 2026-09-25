import type { PriceFrequency } from "@prisma/client";

/** Normalised monthly rent used for filtering and sorting. */
export function monthlyFrom(price: number, freq: PriceFrequency): number {
  return freq === "YEARLY" ? Math.round(price / 12) : freq === "QUARTERLY" ? Math.round(price / 3) : price;
}

/** Rent-only guard: listings may never be advertised for sale. */
const SALE_WORDS = /\b(for\s+sale|on\s+sale|sale\s+price|sold|buy|purchase|installments?\s+plan)\b/i;

export function containsSaleLanguage(...texts: (string | null | undefined)[]): boolean {
  return texts.some((t) => !!t && SALE_WORDS.test(t));
}
