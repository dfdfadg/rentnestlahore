import { expect, test } from "@playwright/test";
import path from "node:path";
import { ADMIN_EMAIL, ADMIN_PASSWORD, login, prisma } from "./helpers";

test.describe.configure({ mode: "serial" });
const stamp = Date.now();
const phone = `0321${String(stamp).slice(-7)}`;
const intl = `+92${phone.slice(1)}`;

test.afterAll(async () => {
  await prisma.property.deleteMany({ where: { agent: { phone: intl } } });
  await prisma.agent.deleteMany({ where: { phone: intl } });
  await prisma.rentRequirement.deleteMany({ where: { phone: intl } });
  await prisma.propertyLead.deleteMany({ where: { phone: intl } });
  await prisma.$disconnect();
});

test("quick listing: no account, photo upload, lands in moderation as pending", async ({ page }) => {
  await page.goto("/add-property/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/List your property for rent/);
  await page.locator("#q-type").selectOption({ label: "Upper Portion" });
  await page.locator("#q-loc").selectOption({ label: "Wapda Town" });
  await page.locator("#q-price").fill("48000");
  await page.locator("#q-area").fill("10");
  await page.locator("#q-beds").fill("2");
  await page.locator('input[type="file"]').setInputFiles(path.join(process.cwd(), "public/demo/photos/house-2.webp"));
  await page.locator("#q-name").fill("Quick Landlord");
  await page.locator("#q-phone").fill(phone);

  // consent is required
  await page.getByRole("button", { name: "Submit property for free" }).click();
  await expect(page.getByText("Please confirm you are the owner")).toBeVisible();

  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Submit property for free" }).click();
  await expect(page.getByText("Shukriya! Your property has been received.")).toBeVisible({ timeout: 20_000 });

  const p = await prisma.property.findFirstOrThrow({ where: { agent: { phone: intl } }, include: { images: true } });
  expect(p.status).toBe("PENDING_REVIEW");
  expect(p.source).toBe("quick_form");
  expect(p.title).toBe("10 Marla Upper Portion for Rent in Wapda Town");
  expect(p.description).toContain("Monthly rent PKR 48,000");
  expect(p.images).toHaveLength(1);
  // not public until approved
  expect((await page.goto(`/property/${p.slug}/`))?.status()).toBe(404);
});

test("quick listing rejects sale wording and duplicates", async ({ page }) => {
  await page.goto("/add-property/");
  await page.locator("#q-type").selectOption({ label: "Upper Portion" });
  await page.locator("#q-loc").selectOption({ label: "Wapda Town" });
  await page.locator("#q-price").fill("48000");
  await page.locator("#q-area").fill("10");
  await page.locator("#q-name").fill("Quick Landlord");
  await page.locator("#q-phone").fill(phone);
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Submit property for free" }).click();
  await expect(page.getByText("We already have this property")).toBeVisible();
});

test("rent requirement form stores a lead", async ({ page }) => {
  await page.goto("/rent-requirement/");
  await page.locator("#r-type").selectOption("House");
  await page.locator("#r-areas").fill("Johar Town, Wapda Town");
  await page.locator("#r-max").fill("90000");
  await page.locator("#r-beds").fill("3");
  await page.locator("#r-name").fill("Renter E2E");
  await page.locator("#r-phone").fill(phone);
  await page.getByRole("button", { name: "Send my requirement" }).click();
  await expect(page.getByText("We've received your requirement")).toBeVisible();
  const r = await prisma.rentRequirement.findFirstOrThrow({ where: { phone: intl } });
  expect(r.areas).toBe("Johar Town, Wapda Town");
  expect(r.budgetMax).toBe(90000);
});

test("admin sees quick-form submissions and requirements", async ({ page }) => {
  test.skip(!ADMIN_PASSWORD, "Set E2E_ADMIN_PASSWORD to run admin tests");
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.goto("/admin/");
  await expect(page.getByText("Quick form: call to confirm").first()).toBeVisible();
  await page.goto("/admin/requirements/");
  await expect(page.getByText("House in Johar Town, Wapda Town")).toBeVisible();
});

test("category and area pages show editorial content with FAQs", async ({ page }) => {
  await page.goto("/rent/houses/");
  await expect(page.getByRole("heading", { name: "Finding a house on rent in Lahore" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Frequently asked questions" })).toBeVisible();
  await expect(page).toHaveTitle(/Houses for Rent in Lahore/);
  await page.goto("/rent/johar-town/");
  await expect(page.getByRole("heading", { name: "Why Johar Town is so popular with renters" })).toBeVisible();
  const ld = await page.locator('script[type="application/ld+json"]').allInnerTexts();
  expect(ld.some((t) => t.includes('"FAQPage"'))).toBe(true);
});

test("buy/sell consultation stores a seller lead (page is noindex)", async ({ page }) => {
  await page.goto("/buy-sell-consultation/?intent=sell");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByLabel("Sell my property")).toBeChecked();
  await page.locator("#l-area").fill("DHA Phase 6, Block C");
  await page.locator("#l-size").fill("1 Kanal");
  await page.locator("#l-min").fill("95000000");
  await page.locator("#l-name").fill("Seller E2E");
  await page.locator("#l-phone").fill(phone);
  await page.getByRole("button", { name: "Request free consultation" }).click();
  await expect(page.getByText("Please agree to share your details")).toBeVisible();
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Request free consultation" }).click();
  await expect(page.getByText("A property consultant will call or WhatsApp you shortly")).toBeVisible();
  const lead = await prisma.propertyLead.findFirstOrThrow({ where: { phone: intl } });
  expect(lead.intent).toBe("SELL");
  expect(lead.budgetMin).toBe(95_000_000);
  expect(lead.status).toBe("NEW");
});

test("admin sees buy/sell leads", async ({ page }) => {
  test.skip(!ADMIN_PASSWORD, "Set E2E_ADMIN_PASSWORD to run admin tests");
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.goto("/admin/property-leads/");
  await expect(page.getByText("DHA Phase 6, Block C").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Copy lead/ }).first()).toBeVisible();
});
