import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "./db";

export type TypeRentStat = { typeId: string; name: string; pluralName: string; pluralSlug: string; count: number; median: number; min: number; max: number };

/** Live rent statistics per property type from active listings (optionally within some locations). */
export async function rentStatsByType(locationIds?: string[], typeIds?: string[]): Promise<TypeRentStat[]> {
  const locFilter = locationIds?.length ? Prisma.sql`AND p."locationId" IN (${Prisma.join(locationIds)})` : Prisma.empty;
  const typeFilter = typeIds?.length ? Prisma.sql`AND p."propertyTypeId" IN (${Prisma.join(typeIds)})` : Prisma.empty;
  const rows = await prisma.$queryRaw<
    { typeId: string; name: string; pluralName: string; pluralSlug: string; count: bigint; median: number; min: number; max: number }[]
  >(Prisma.sql`
    SELECT pt.id AS "typeId", pt.name, pt."pluralName", pt."pluralSlug",
           COUNT(*) AS count,
           percentile_cont(0.5) WITHIN GROUP (ORDER BY p."monthlyRent") AS median,
           MIN(p."monthlyRent") AS min, MAX(p."monthlyRent") AS max
    FROM "Property" p
    JOIN "PropertyType" pt ON pt.id = p."propertyTypeId"
    WHERE p.status = 'PUBLISHED' AND p.purpose = 'RENT'
      AND (p."expiresAt" IS NULL OR p."expiresAt" > NOW())
      ${locFilter} ${typeFilter}
    GROUP BY pt.id, pt.name, pt."pluralName", pt."pluralSlug", pt."sortOrder"
    ORDER BY pt."sortOrder"
  `);
  return rows.map((r) => ({ ...r, count: Number(r.count), median: Math.round(Number(r.median)), min: Number(r.min), max: Number(r.max) }));
}
