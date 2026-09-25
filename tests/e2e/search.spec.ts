import { expect, test } from "@playwright/test";
import { active, prisma, resultTotal, typeIds } from "./helpers";

test.afterAll(async () => prisma.$disconnect());

test("homepage renders hero, search and key sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Find Your Place to Rent in Lahore/);
  await expect(page.getByRole("button", { name: "Search Rentals" })).toBeVisible();
  for (const h of ["Latest rental properties", "Popular rental categories", "Popular Lahore areas", "Why RentNest Lahore", "Rental guides", "Frequently asked questions"]) {
    await expect(page.getByRole("heading", { name: h })).toBeVisible();
  }
  // Rent-only: no buy/sale navigation anywhere
  await expect(page.getByRole("navigation", { name: "Main" })).not.toContainText(/buy|sale/i);
});

test("hero search builds a clean URL and returns matching rentals", async ({ page }) => {
  await page.goto("/");
  await page.locator("#hero-type").selectOption("houses");
  await page.locator("#hero-area").selectOption("dha-lahore");
  await page.locator("#hero-beds").selectOption("4");
  await page.getByRole("button", { name: "Search Rentals" }).click();
  await page.waitForURL("**/rent/dha-lahore/houses/?beds=4");
  const dha = await prisma.location.findUniqueOrThrow({ where: { slug: "dha-lahore" }, include: { children: true } });
  const expected = await prisma.property.count({
    where: { AND: [active(), { propertyTypeId: { in: await typeIds("house") } }, { locationId: { in: [dha.id, ...dha.children.map((c) => c.id)] } }, { bedrooms: { gte: 4 } }] },
  });
  expect(await resultTotal(page)).toBe(expected);
});

const cases: { name: string; url: string; where: () => Promise<object> }[] = [
  { name: "beds", url: "/rent/houses/?beds=4", where: async () => ({ propertyTypeId: { in: await typeIds("house") }, bedrooms: { gte: 4 } }) },
  { name: "baths", url: "/rent/?baths=3", where: async () => ({ bathrooms: { gte: 3 } }) },
  { name: "rent range", url: "/rent/?min_price=50000&max_price=150000", where: async () => ({ monthlyRent: { gte: 50000, lte: 150000 } }) },
  { name: "area range marla", url: "/rent/?min_area=10&max_area=20&unit=marla", where: async () => ({ areaSqft: { gte: 2250, lte: 4500 } }) },
  { name: "area kanal", url: "/rent/?min_area=1&unit=kanal", where: async () => ({ areaSqft: { gte: 4500 } }) },
  { name: "furnished", url: "/rent/?furnished=furnished", where: async () => ({ furnished: "FURNISHED" }) },
  { name: "semi furnished", url: "/rent/?furnished=semi-furnished", where: async () => ({ furnished: "SEMI_FURNISHED" }) },
  { name: "condition", url: "/rent/?condition=brand-new", where: async () => ({ condition: "BRAND_NEW" }) },
  { name: "amenities (all required)", url: "/rent/?amenities=parking,security", where: async () => ({ AND: [{ amenities: { some: { slug: "parking" } } }, { amenities: { some: { slug: "security" } } }] }) },
  { name: "main road offices", url: "/rent/offices/?main_road=1", where: async () => ({ propertyTypeId: { in: await typeIds("office") }, mainRoad: true }) },
  { name: "corner", url: "/rent/commercial-properties/?corner=1", where: async () => ({ propertyType: { category: "COMMERCIAL" }, corner: true }) },
  { name: "floor", url: "/rent/?floor=0", where: async () => ({ floor: 0 }) },
  { name: "front", url: "/rent/shops/?min_front=20", where: async () => ({ propertyTypeId: { in: await typeIds("shop") }, frontFt: { gte: 20 } }) },
  { name: "loading + height", url: "/rent/warehouses/?loading=1&min_height=25", where: async () => ({ propertyTypeId: { in: await typeIds("warehouse") }, loadingArea: true, ceilingHeightFt: { gte: 25 } }) },
  { name: "verified", url: "/rent/?verified=1", where: async () => ({ verified: true }) },
  { name: "portions group", url: "/rent/portions/", where: async () => ({ propertyTypeId: { in: await typeIds("upper-portion", "lower-portion") } }) },
  { name: "keyword", url: "/rent/?q=Block%20A", where: async () => ({ OR: [{ title: { contains: "Block A", mode: "insensitive" } }, { society: { contains: "Block A", mode: "insensitive" } }, { address: { contains: "Block A", mode: "insensitive" } }, { location: { name: { contains: "Block A", mode: "insensitive" } } }] }) },
  { name: "combined", url: "/rent/johar-town/?beds=2&max_price=100000&furnished=unfurnished", where: async () => ({ location: { slug: "johar-town" }, bedrooms: { gte: 2 }, monthlyRent: { lte: 100000 }, furnished: "UNFURNISHED" }) },
];

for (const c of cases) {
  test(`filter works: ${c.name}`, async ({ page }) => {
    await page.goto(c.url);
    const expected = await prisma.property.count({ where: { AND: [active(), await c.where()] } });
    expect(await resultTotal(page)).toBe(expected);
    if (c.url.includes("?")) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    }
  });
}

test("area pages include sub-areas (DHA phases)", async ({ page }) => {
  await page.goto("/rent/dha-lahore/");
  const dha = await prisma.location.findUniqueOrThrow({ where: { slug: "dha-lahore" }, include: { children: true } });
  const expected = await prisma.property.count({ where: { AND: [active(), { locationId: { in: [dha.id, ...dha.children.map((c) => c.id)] } }] } });
  expect(await resultTotal(page)).toBe(expected);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Properties for Rent in DHA Lahore");
});

test("sorting by rent works in both directions", async ({ page }) => {
  for (const [sort, dir] of [["price_asc", 1], ["price_desc", -1]] as const) {
    await page.goto(`/rent/?sort=${sort}`);
    const prices = (await page.locator("article p span.text-xl").allInnerTexts()).map((t) => Number(t.replace(/[^\d]/g, "")));
    expect(prices.length).toBeGreaterThan(5);
    for (let i = 1; i < prices.length; i++) expect((prices[i] - prices[i - 1]) * dir).toBeGreaterThanOrEqual(0);
  }
});

test("sorting by area and date matches the database order", async ({ page }) => {
  for (const [sort, orderBy] of [
    ["area_asc", [{ areaSqft: "asc" }, { id: "asc" }]],
    ["area_desc", [{ areaSqft: "desc" }, { id: "asc" }]],
    ["oldest", [{ publishedAt: "asc" }, { id: "asc" }]],
  ] as const) {
    await page.goto(`/rent/?sort=${sort}`);
    const hrefs = await page.locator("article h3 a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    const expected = await prisma.property.findMany({ where: active(), orderBy: orderBy as never, take: 20, select: { slug: true } });
    expect(hrefs).toEqual(expected.map((p) => `/property/${p.slug}/`));
  }
});

test("crawlable pagination", async ({ page }) => {
  const total = await prisma.property.count({ where: active() });
  await page.goto("/rent/");
  await expect(page.locator("article")).toHaveCount(Math.min(20, total));
  const next = page.locator('nav[aria-label="Pagination"] a[rel="next"]');
  await expect(next).toHaveAttribute("href", "/rent/page/2/");
  await next.click();
  await page.waitForURL("**/rent/page/2/");
  await expect(page.locator("article")).toHaveCount(Math.min(20, total - 20));
  await expect(page).toHaveTitle(/Page 2/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/rent\/page\/2\/$/);
});

test("legacy ?type= and ?area= params redirect to clean URLs", async ({ page }) => {
  const res = await page.goto("/rent/?type=flats&area=gulberg&beds=2");
  expect(res?.status()).toBe(200);
  expect(new URL(page.url()).pathname + new URL(page.url()).search).toBe("/rent/gulberg/flats/?beds=2");
});

test("unknown listing URLs return 404", async ({ page }) => {
  for (const url of ["/rent/nowhere/", "/rent/houses/dha-lahore/", "/rent/houses/page/999/", "/property/not-a-real-listing/"]) {
    const res = await page.goto(url);
    expect(res?.status(), url).toBe(404);
  }
  await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
});

test("empty results show helpful actions and no fake listings", async ({ page }) => {
  await page.goto("/rent/?min_price=90000000");
  await expect(page.getByRole("heading", { name: "No rental properties found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Clear Filters" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View All Rentals" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Try Another Area" })).toBeVisible();
  await expect(page.locator("article")).toHaveCount(0);
});

test("sidebar filter form updates the URL and preserves state", async ({ page }) => {
  await page.goto("/rent/");
  await page.locator("#f-type").selectOption("houses");
  await page.locator("#f-beds").selectOption("3");
  await page.locator('input[name="amenities"][value="parking"]').check();
  await page.getByRole("button", { name: "Apply filters" }).click();
  await page.waitForURL("**/rent/houses/?beds=3&amenities=parking");
  await expect(page.locator("#f-beds")).toHaveValue("3");
  await expect(page.locator('input[name="amenities"][value="parking"]')).toBeChecked();
  await page.getByRole("combobox", { name: "Sort rentals" }).selectOption("price_desc");
  await page.waitForURL(/sort=price_desc/);
  expect(page.url()).toContain("beds=3");
});

test("mobile filter drawer works", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("/rent/houses/");
  await expect(page.locator("#rental-filters")).toBeHidden();
  await page.getByRole("button", { name: "Filters" }).click();
  await expect(page.locator("#rental-filters")).toBeVisible();
  await page.locator("#f-beds").selectOption("5");
  await page.getByRole("button", { name: /Show .* results/ }).click();
  await page.waitForURL("**/rent/houses/?beds=5");
  await ctx.close();
});

test("rented, expired and unpublished listings never appear in search", async ({ page }) => {
  const hidden = await prisma.property.findMany({ where: { status: { in: ["RENTED", "EXPIRED", "DRAFT", "PENDING_REVIEW", "REJECTED"] } }, select: { slug: true } });
  expect(hidden.length).toBeGreaterThan(0);
  const all: string[] = [];
  for (let p = 1; ; p++) {
    await page.goto(p === 1 ? "/rent/" : `/rent/page/${p}/`);
    const hrefs = await page.locator("article h3 a").evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
    all.push(...hrefs);
    if (!(await page.locator('a[rel="next"]').count())) break;
  }
  for (const h of hidden) expect(all).not.toContain(`/property/${h.slug}/`);
});
