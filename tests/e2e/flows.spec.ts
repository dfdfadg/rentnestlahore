import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import { writeFileSync } from "node:fs";
import os from "node:os";
import { ADMIN_EMAIL, ADMIN_PASSWORD, active, login, prisma } from "./helpers";

test.describe.configure({ mode: "serial" });

const stamp = Date.now();
const user = { name: "E2E Landlord", email: `e2e-${stamp}@example.com`, password: "Tenant123pass" };
let propertyId = "";

test.afterAll(async () => {
  await prisma.property.deleteMany({ where: { agent: { user: { email: user.email } } } });
  await prisma.property.deleteMany({ where: { description: { contains: `e2e-csv-${stamp}` } } });
  await prisma.agent.deleteMany({ where: { OR: [{ user: { email: user.email } }, { phone: "+923215550000" }] } });
  await prisma.user.deleteMany({ where: { email: user.email } });
  await prisma.$disconnect();
});

async function logout(page: Page) {
  await page.context().clearCookies();
}

test("register a new account", async ({ page }) => {
  await page.goto("/register/");
  await page.getByLabel("Full name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Mobile number").fill("0333 9998877");
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByLabel("Confirm password").fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/dashboard/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hello, E2E");
  const u = await prisma.user.findUniqueOrThrow({ where: { email: user.email } });
  expect(u.passwordHash).toMatch(/^\$2[aby]\$12\$/); // bcrypt, never plain text
});

test("duplicate registration and bad login are rejected", async ({ page }) => {
  await logout(page);
  await page.goto("/register/");
  await page.getByLabel("Full name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Mobile number").fill("0333 9998877");
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByLabel("Confirm password").fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("already exists")).toBeVisible();
  await page.goto("/login/");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill("wrong-password-1");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("Incorrect email or password")).toBeVisible();
});

test("save and remove a favorite", async ({ page }) => {
  await login(page, user.email, user.password);
  await page.goto("/rent/houses/");
  const firstCard = page.locator("article").first();
  const href = await firstCard.locator("h3 a").getAttribute("href");
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/favorites/") && r.request().method() === "POST"),
    firstCard.getByRole("button", { name: "Save this rental" }).click(),
  ]);
  await expect(firstCard.getByRole("button", { name: "Remove from saved rentals" })).toBeVisible();
  await page.goto("/favorites/");
  await expect(page.locator(`article a[href="${href}"]`)).toBeVisible();
  await page.getByRole("button", { name: "Remove from saved rentals" }).first().click();
  await expect.poll(async () => prisma.favorite.count({ where: { user: { email: user.email } } })).toBe(0);
});

test("submit a rental property with a photo", async ({ page }) => {
  await login(page, user.email, user.password);
  await page.goto("/my-properties/new/");
  await page.locator("#pf-type").selectOption({ label: "House" });
  await page.locator("#pf-price").fill("95000");
  await page.locator("#pf-area").fill("10");
  await page.locator("#pf-beds").fill("4");
  await page.locator("#pf-baths").fill("4");
  await page.locator("#pf-loc").selectOption({ label: "Johar Town" });
  await page.locator("#pf-soc").fill("Block R");
  await page.locator("#pf-desc").fill(`E2E test listing ${stamp}. Well maintained 10 Marla house with separate meters, near park and schools.`);
  await page.locator('input[name="amenityIds"]').first().check();
  await page.locator("#pf-cp").fill("0333 9998877");
  await page.getByRole("button", { name: "Save & add photos" }).click();
  await page.waitForURL(/\/my-properties\/[^/]+\/photos\/\?new=1/);
  propertyId = page.url().split("/my-properties/")[1].split("/")[0];
  const p = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });
  expect(p.title).toBe("10 Marla House for Rent in Johar Town");
  expect(p.status).toBe("DRAFT");
  expect(p.purpose).toBe("RENT");

  // submitting without photos is blocked
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByText("Please add at least one photo")).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles(path.join(process.cwd(), "public/demo/photos/house-3.webp"));
  await expect(page.getByText("Primary")).toBeVisible({ timeout: 20_000 });
  const img = await prisma.propertyImage.findFirstOrThrow({ where: { propertyId } });
  expect(img.url).toMatch(/\.webp$/);
  expect((await page.request.get(img.url)).status()).toBe(200);

  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByText("Your listing is waiting for review")).toBeVisible();
  expect((await prisma.property.findUniqueOrThrow({ where: { id: propertyId } })).status).toBe("PENDING_REVIEW");
});

test("sale wording and non-image uploads are rejected", async ({ page }) => {
  await login(page, user.email, user.password);
  await page.goto(`/my-properties/${propertyId}/edit/`);
  await page.locator("#pf-desc").fill("This house is for sale at a great price, contact now for details.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("rental properties only").first()).toBeVisible();

  const fake = path.join(os.tmpdir(), `fake-${stamp}.jpg`);
  writeFileSync(fake, "<script>alert(1)</script>");
  await page.goto(`/my-properties/${propertyId}/photos/`);
  await page.locator('input[type="file"]').setInputFiles(fake);
  await expect(page.getByText("not a valid image")).toBeVisible({ timeout: 20_000 });
});

test("pending listings are not public and other users cannot edit them", async ({ page }) => {
  const p = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });
  await logout(page);
  expect((await page.goto(`/property/${p.slug}/`))?.status()).toBe(404);
  const base = new URL(page.url()).origin;
  const res = await page.request.post(`/api/properties/${propertyId}/images/`, { headers: { origin: base }, multipart: { files: { name: "a.jpg", mimeType: "image/jpeg", buffer: Buffer.from("x") } } });
  expect(res.status()).toBe(401);
  const csrf = await page.request.post(`/api/favorites/`, { headers: { origin: "https://evil.example" }, data: { propertyId: propertyId } });
  expect(csrf.status()).toBe(403);
  expect((await page.goto("/my-properties/"))?.url()).toContain("/login/");
});

test("non-admins cannot reach the admin panel", async ({ page }) => {
  await login(page, user.email, user.password);
  expect((await page.goto("/admin/"))?.status()).toBe(404);
  expect((await page.goto("/admin/properties/"))?.status()).toBe(404);
});

test.describe("admin", () => {
  test.skip(!ADMIN_PASSWORD, "Set E2E_ADMIN_PASSWORD to run admin tests");

  test("admin approves the listing and it appears in search", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/admin/");
    const p = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });
    const row = page.locator("li", { hasText: p.title }).filter({ hasText: "E2E Landlord" }).first();
    await row.getByRole("button", { name: "Approve" }).click();
    await expect.poll(async () => (await prisma.property.findUniqueOrThrow({ where: { id: propertyId } })).status).toBe("PUBLISHED");
    await page.goto(`/property/${p.slug}/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title);
    await page.goto("/rent/johar-town/houses/?sort=newest");
    await expect(page.locator(`article a[href="/property/${p.slug}/"]`)).toBeVisible();
  });

  test("admin edits the title: slug changes and the old URL redirects", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    const before = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });
    await page.goto(`/admin/properties/${propertyId}/edit/`);
    await page.locator("#pf-title").fill(`Renovated 10 Marla House for Rent in Johar Town ${stamp}`);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Listing saved.")).toBeVisible();
    const after = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });
    expect(after.slug).not.toBe(before.slug);
    expect(after.status).toBe("PUBLISHED");
    await page.goto(`/property/${before.slug}/`);
    expect(new URL(page.url()).pathname).toBe(`/property/${after.slug}/`);
  });

  test("admin feature + verify toggles show badges", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto(`/admin/properties/${propertyId}/photos/`);
    await page.getByRole("button", { name: "Feature", exact: true }).click();
    await expect(page.getByRole("button", { name: "★ Featured" })).toBeVisible();
    await page.getByRole("button", { name: "Verify", exact: true }).click();
    await expect(page.getByRole("button", { name: "✓ Verified" })).toBeVisible();
    const p = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });
    await page.goto(`/property/${p.slug}/`);
    await expect(page.getByText("Verified Property")).toBeVisible();
  });

  test("all admin pages load without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    for (const url of ["/admin/", "/admin/properties/", "/admin/properties/?status=PENDING_REVIEW&demo=1", "/admin/properties/new/", `/admin/properties/${propertyId}/preview/`, "/admin/import/", "/admin/enquiries/", "/admin/reports/", "/admin/agents/", "/admin/agents/new/", "/admin/users/", "/admin/locations/", "/admin/property-types/", "/admin/amenities/"]) {
      const res = await page.goto(url);
      expect(res?.status(), url).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test("CSV import validates first, then imports valid rows as pending", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    const desc = `Spacious upper portion with separate entrance and meters, e2e-csv-${stamp}.`;
    const csv = [
      "title,property_type,price,price_frequency,area,area_unit,bedrooms,bathrooms,location,society,address,description,agent_name,agent_phone,whatsapp,images,latitude,longitude,featured,verified,status",
      `,upper-portion,55000,monthly,10,marla,3,3,Wapda Town,Block F,,"${desc}",CSV Agent,03215550000,,,,,false,false,pending_review`,
      `,office,1200000,yearly,900,sqft,,2,gulberg,,,"Furnished office on the 3rd floor with lift and backup power, e2e-csv-${stamp}.",CSV Agent,03215550000,,https://example.com/a.jpg,,,no,no,published`,
      `House for sale,house,100,monthly,5,marla,3,3,Atlantis,,,"short",,123,,,,,,,`,
    ].join("\n");
    const file = path.join(os.tmpdir(), `import-${stamp}.csv`);
    writeFileSync(file, csv);
    await page.goto("/admin/import/");
    await page.locator("#csv").setInputFiles(file);
    await page.getByRole("button", { name: "1. Validate (dry run)" }).click();
    await expect(page.getByText("2 valid row(s), 1 row(s) with errors")).toBeVisible();
    await expect(page.locator("li", { hasText: "Row 4:" })).toContainText("Unknown location");
    expect(await prisma.property.count({ where: { description: { contains: `e2e-csv-${stamp}` } } })).toBe(0);
    await page.locator("#csv").setInputFiles(file);
    await page.getByRole("button", { name: "2. Import valid rows" }).click();
    await expect(page.getByText("Imported 2 listing(s)")).toBeVisible();
    const rows = await prisma.property.findMany({ where: { description: { contains: `e2e-csv-${stamp}` } }, orderBy: { refNo: "asc" } });
    expect(rows.map((r) => r.status)).toEqual(["PENDING_REVIEW", "PUBLISHED"]);
    expect(rows[1].monthlyRent).toBe(100000); // yearly normalised
    expect(rows[0].title).toBe("10 Marla Upper Portion for Rent in Wapda Town");
  });
});

test("owner marks the listing rented: it leaves search results", async ({ page }) => {
  const p = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });
  test.skip(p.status !== "PUBLISHED", "requires admin approval step");
  await login(page, user.email, user.password);
  await page.goto("/my-properties/");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Mark rented" }).click();
  await expect(page.getByText("Marked as rented")).toBeVisible(); // server action (incl. cache revalidation) finished
  expect((await prisma.property.findUniqueOrThrow({ where: { id: propertyId } })).status).toBe("RENTED");
  expect(await prisma.property.count({ where: { AND: [active(), { id: propertyId }] } })).toBe(0);
  // Cached pages are revalidated by the action; allow a moment for the new version to be served.
  await expect.poll(async () => (await (await page.request.get(`/property/${p.slug}/`)).text()).includes("has been rented"), { timeout: 10_000 }).toBe(true);
  await page.goto(`/property/${p.slug}/`);
  await expect(page.getByText("This property has been rented")).toBeVisible();
});

test("owner deletes the listing", async ({ page }) => {
  await login(page, user.email, user.password);
  await page.goto("/my-properties/");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete" }).first().click();
  await expect(page.getByText("You haven't listed a property yet.")).toBeVisible();
  await expect.poll(async () => prisma.property.count({ where: { id: propertyId } })).toBe(0);
});
