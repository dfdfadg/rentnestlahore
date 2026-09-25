import { expect, test } from "@playwright/test";
import { active, prisma } from "./helpers";

test.afterAll(async () => prisma.$disconnect());

async function publishedWithImages() {
  return prisma.property.findFirstOrThrow({
    where: { AND: [active(), { images: { some: { position: 3 } } }] },
    include: { images: true, location: true },
  });
}

test("property detail page shows all key information", async ({ page }) => {
  const p = await publishedWithImages();
  await page.goto(`/property/${p.slug}/`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title);
  await expect(page.getByText("Monthly rent", { exact: true })).toBeVisible();
  await expect(page.getByText(`RN-${p.refNo}`).first()).toBeVisible();
  for (const h of ["Description", "Property details", "Location", "Send an enquiry"]) await expect(page.getByRole("heading", { name: h })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText(p.location.name);
  await expect(page.getByText("For Rent", { exact: true })).toBeVisible();
  const ld = await page.locator('script[type="application/ld+json"]').allInnerTexts();
  const types = ld.flatMap((t) => [JSON.parse(t)].flat().map((x: { "@type": string }) => x["@type"]));
  expect(types).toContain("RealEstateListing");
  expect(types).toContain("BreadcrumbList");
  // phone numbers are not embedded in the HTML
  const html = await page.content();
  const agent = await prisma.agent.findUniqueOrThrow({ where: { id: p.agentId } });
  expect(html).not.toContain(agent.phone);
});

test("gallery: next/prev, thumbnails and fullscreen", async ({ page }) => {
  const p = await publishedWithImages();
  await page.goto(`/property/${p.slug}/`);
  await expect(page.getByText(`1 / ${p.images.length}`).first()).toBeVisible();
  await page.getByRole("button", { name: "Next photo" }).first().click();
  await expect(page.getByText(`2 / ${p.images.length}`).first()).toBeVisible();
  await page.getByRole("button", { name: "Show photo 4" }).click();
  await expect(page.getByText(`4 / ${p.images.length}`).first()).toBeVisible();
  await page.getByRole("button", { name: "View all photos" }).click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(dialog).toContainText(`1 / ${p.images.length}`);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  // All gallery images have alt text
  const alts = await page.locator("main img").evaluateAll((els) => els.map((e) => e.getAttribute("alt")));
  expect(alts.every((a) => a !== null)).toBe(true);
});

test("WhatsApp opens a pre-filled chat and Call reveals the number", async ({ page, context }) => {
  const p = await publishedWithImages();
  await context.route("https://wa.me/**", (r) => r.fulfill({ status: 200, body: "whatsapp" }));
  await page.goto(`/property/${p.slug}/`);
  const [popup] = await Promise.all([context.waitForEvent("page"), page.getByRole("button", { name: "WhatsApp" }).first().click()]);
  await popup.waitForURL(/wa\.me/);
  const url = new URL(popup.url());
  expect(decodeURIComponent(url.search)).toContain("Hello, I am interested in this rental property on RentNest Lahore:");
  expect(decodeURIComponent(url.search)).toContain(`/property/${p.slug}/`);
  const res = await page.request.get(`/api/properties/${p.id}/contact/`);
  expect(res.ok()).toBe(true);
  expect((await res.json()).phone).toMatch(/^\+92/);
});

test("enquiry form stores an enquiry for the agent", async ({ page }) => {
  const p = await publishedWithImages();
  const phone = `0300${String(Date.now()).slice(-7)}`;
  await page.goto(`/property/${p.slug}/`);
  await page.getByLabel("Name").fill("E2E Tester");
  await page.getByLabel("Phone").fill(phone);
  await page.getByLabel("WhatsApp").check();
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByText("your enquiry has been sent")).toBeVisible();
  const enq = await prisma.enquiry.findFirst({ where: { phone: `+92${phone.slice(1)}` } });
  expect(enq?.agentId).toBe(p.agentId);
  expect(enq?.preferredContact).toBe("WHATSAPP");
  await prisma.enquiry.deleteMany({ where: { phone: `+92${phone.slice(1)}` } });
});

test("enquiry validation errors are shown", async ({ page }) => {
  const p = await publishedWithImages();
  await page.goto(`/property/${p.slug}/`);
  await page.getByLabel("Phone").fill("123");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByText("Enter a valid Pakistani phone number")).toBeVisible();
});

test("report property", async ({ page }) => {
  const p = await publishedWithImages();
  await page.goto(`/property/${p.slug}/`);
  await page.getByText("Report this property").click();
  await page.locator("#rep-reason").selectOption("wrong-price");
  await page.locator("#rep-details").fill("e2e-report-test");
  await page.getByRole("button", { name: "Submit report" }).click();
  await expect(page.getByText("Our team will review this listing")).toBeVisible();
  expect(await prisma.report.count({ where: { details: "e2e-report-test" } })).toBe(1);
  await prisma.report.deleteMany({ where: { details: "e2e-report-test" } });
});

test("rented listings show as unavailable and are noindexed; drafts 404", async ({ page }) => {
  const rented = await prisma.property.findFirstOrThrow({ where: { status: "RENTED" } });
  await page.goto(`/property/${rented.slug}/`);
  await expect(page.getByText("This property has been rented")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("button", { name: "WhatsApp" })).toHaveCount(0);
  const draft = await prisma.property.findFirstOrThrow({ where: { status: "DRAFT" } });
  expect((await page.goto(`/property/${draft.slug}/`))?.status()).toBe(404);
});

test("favorites require login", async ({ page }) => {
  await page.goto("/rent/");
  await page.getByRole("button", { name: "Save this rental" }).first().click();
  await page.waitForURL(/\/login\/\?next=/);
});

test("robots.txt, sitemaps and noindex of private pages", async ({ page, request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin/");
  expect(robots).toContain("Sitemap:");
  const index = await (await request.get("/sitemap.xml")).text();
  expect(index).toContain("/sitemaps/pages.xml");
  expect(index).toContain("/sitemaps/properties-1.xml");
  const listings = await (await request.get("/sitemaps/listings.xml")).text();
  expect(listings).toContain("/rent/houses/");
  expect(listings).not.toMatch(/<loc>[^<]*\?/);
  const props = await (await request.get("/sitemaps/properties-1.xml")).text();
  const demoSlugs = await prisma.property.findMany({ where: { isDemo: true }, select: { slug: true }, take: 20 });
  for (const d of demoSlugs) expect(props).not.toContain(`/property/${d.slug}/`);
  await page.goto("/login/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
