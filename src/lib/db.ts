import { PrismaClient } from "@prisma/client";

// Accept the variable names created by Vercel's Postgres/Neon integration.
if (!process.env.DATABASE_URL?.trim()) {
  const fallback = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
  if (fallback) process.env.DATABASE_URL = fallback;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
