export const RENT_OPTIONS = [
  10000, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 75000, 100000, 125000, 150000, 200000, 250000, 300000, 400000,
  500000, 750000, 1000000, 2000000, 5000000,
];
export const BED_OPTIONS = [1, 2, 3, 4, 5, 6];
export const FLOOR_OPTIONS = [
  { value: -1, label: "Basement" },
  { value: 0, label: "Ground floor" },
  ...Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: `${i + 1}${["st", "nd", "rd"][i] ?? "th"} floor` })),
];

export type FilterOption = { value: string; label: string };
export type TypeOption = { slug: string; name: string; category: "RESIDENTIAL" | "COMMERCIAL" | "MIXED"; isGroup: boolean };
export type LocationOption = { slug: string; name: string; depth: number };

export function shortPKR(n: number): string {
  if (n >= 10_000_000) return `${n / 10_000_000} Crore`;
  if (n >= 100_000) return `${n / 100_000} Lakh`;
  return `${n / 1000}K`;
}
