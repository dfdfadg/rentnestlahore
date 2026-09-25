import { PrismaClient, type Prisma } from "@prisma/client";
import type { Page } from "@playwright/test";

export const prisma = new PrismaClient();

export function active(): Prisma.PropertyWhereInput {
  return { purpose: "RENT", status: "PUBLISHED", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
}

/** Reads the "Showing X–Y of N" total from a listing page (0 when empty). */
export async function resultTotal(page: Page): Promise<number> {
  const text = (await page.locator('section[aria-label="Rental results"] p[aria-live]').first().innerText()).replace(/,/g, "");
  const m = /of (\d+)/.exec(text);
  return m ? Number(m[1]) : 0;
}

export async function typeIds(...slugs: string[]) {
  return (await prisma.propertyType.findMany({ where: { slug: { in: slugs } }, select: { id: true } })).map((t) => t.id);
}

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "admin@rentnestlahore.pk";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "";

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login/");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"));
}
