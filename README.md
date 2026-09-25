# RentNest Lahore — rentnestlahore.pk

**Find Your Place in Lahore.** A production-ready, **rent-only, Lahore-only** property marketplace:
houses, flats, apartments, portions, rooms, offices, shops, warehouses and other commercial space for rent.

> There is intentionally **no buy / sale functionality** anywhere — not in the data model
> (`ListingPurpose` has a single value `RENT`), the UI, URLs, filters, schema or content.
> Listings or CSV rows containing sale wording ("for sale", "buy", "sold", …) are rejected.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 — original design system (ink navy + Lahore-brick accent) |
| Database | PostgreSQL + Prisma 6 |
| Auth | Own session auth: bcrypt (cost 12) password hashes, HMAC-hashed session tokens in httpOnly cookies |
| Images | `sharp` validation/re-encoding → Vercel Blob (prod) or local disk (dev); `next/image` responsive AVIF/WebP |
| Validation | zod |
| Tests | Vitest (unit) + Playwright (end-to-end, 53 tests) |
| Hosting | Vercel (config in `vercel.json`, daily cron) |

## Features

**Public site**
- Homepage: hero + rental search, featured, latest, categories, popular areas, houses / flats / commercial rows, trust section, guides, FAQ.
- Real search engine with shareable URLs: property type, area (incl. sub-areas, e.g. DHA Lahore → all phases), keyword,
  min/max rent, bedrooms, bathrooms, min/max area (Marla / Kanal / Sq Ft / Sq Yd), furnishing, condition, 16 amenities,
  and commercial filters (floor, main road, corner, frontage, loading area, warehouse ceiling height), verified-only.
- Sorting: newest, oldest, rent ↑/↓, area ↑/↓. Crawlable pagination (`/rent/houses/page/2/`).
- Desktop filter sidebar, mobile sticky "Filters" button + drawer. Empty state with *Clear Filters / View All Rentals / Try Another Area*.
- Property pages: gallery (thumbnails, fullscreen, keyboard, swipe, lazy loading, alt text), rent, Property ID, key facts,
  description, features, amenities, details table, approximate map (rounded coordinates, no pin), video tour,
  agent card, Call / WhatsApp (pre-filled message), enquiry form, save, share, report, similar rentals, internal links.
- Area pages with live rent snapshot (median/min/max per type from active listings), sub-areas, nearby areas.
- Agent/landlord profiles, area directory, 11 original rental guides, About/Contact/Privacy/Terms, 404/500 pages.

**Accounts** — register, login, forgot/reset password, dashboard, saved rentals, my properties
(create → photos → submit for review, edit, mark rented, delete), enquiries (received + sent), profile & password.

**Admin** (`/admin/`, role `ADMIN`) — moderation queue, approve / reject (with reason) / unpublish / rented / expire,
feature & verify toggles, add/edit/delete any listing, image manager (upload, reorder, set primary, alt text, delete),
CSV import (dry-run validation → import), enquiries, reports, agents (verify, areas served), users (roles, disable),
Lahore locations, property types, amenities — all editable without code changes.

## URL structure

```
/                                   homepage
/rent/                              all rentals (hub)
/rent/houses/  /rent/flats/  /rent/apartments/  /rent/portions/  /rent/rooms/
/rent/offices/ /rent/shops/  /rent/warehouses/  /rent/commercial-properties/   (+ every other type)
/rent/dha-lahore/  /rent/johar-town/  /rent/gulberg/  /rent/bahria-town/ …      area pages
/rent/dha-lahore/houses/  /rent/gulberg/flats/ …                               area + type
/rent/houses/page/2/                                                            pagination
/rent/houses/?area=dha-phase-6&beds=3&min_price=50000&max_price=150000          → 308 to /rent/dha-phase-6/houses/?…
/property/5-marla-house-for-rent-johar-town/                                    listing
/agents/<slug>/   /areas/   /guides/   /guides/<slug>/   /add-property/
```
"Lahore" is not repeated in URLs (the domain already says it) but is used naturally in titles, H1s and content.
All URLs use a trailing slash; `www.rentnestlahore.pk` 308-redirects to `https://rentnestlahore.pk`.

## SEO

- Unique title, meta description, canonical, Open Graph and Twitter tags on every indexable page.
- Filtered URLs (`?beds=…`) are `noindex, follow` and canonicalise to the clean page.
- **No thin pages:** area+type pages are indexable only with ≥ 3 active listings; empty pages are `noindex`;
  only pages with real inventory go into the sitemap. Demo listings and demo agents are always `noindex`
  and excluded from the sitemap.
- JSON-LD: Organization, WebSite (+SearchAction), BreadcrumbList, ItemList, RealEstateListing (lease offer),
  RealEstateAgent, Article (guides), FAQPage (homepage).
- `robots.txt` (private areas disallowed, preview deployments fully disallowed) and a sitemap index at
  `/sitemap.xml` → `/sitemaps/pages.xml`, `/sitemaps/listings.xml`, `/sitemaps/properties-N.xml` (40k URLs per file).
- Old listing URLs permanently redirect (308) to the new slug when a title changes. Rented/expired listings stay reachable
  (marked unavailable, `noindex`); drafts/pending/rejected return 404.
- All important content is server-rendered HTML.

## Local development

Requirements: Node 20+ (22 recommended), PostgreSQL 14+.

```bash
cp .env.example .env            # set DATABASE_URL and AUTH_SECRET at minimum
npm install
npx prisma migrate deploy       # create tables
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='a-strong-password' npm run db:seed:demo
npm run dev                     # http://localhost:3000
```

`npm run db:seed` creates the taxonomy (16 property types, 16 amenities, 37 Lahore locations) and the admin user.
`npm run db:seed:demo` also creates **99 clearly-labelled demo listings** across 22 Lahore areas and 7 demo agents.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` / `test` | ESLint, TypeScript, Vitest unit tests |
| `npm run test:e2e` | Playwright end-to-end tests against a running server (see below) |
| `npm run db:migrate` | Create a new migration in development |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:seed` / `db:seed:demo` | Seed taxonomy + admin (+ demo data) |
| `npm run db:remove-demo` | Delete **all** demo listings and demo agents (real data untouched) |
| `npm run import:csv -- file.csv [--import]` | Validate (default) or import a CSV of listings |
| `npm run demo:images` | Regenerate the original illustrated sample images in `public/demo/` |

### Running the end-to-end tests

```bash
npm run build && npm start &
E2E_BASE_URL=http://localhost:3000 E2E_ADMIN_EMAIL=you@example.com E2E_ADMIN_PASSWORD='…' npm run test:e2e
```
The tests create and clean up their own users/listings. The same pipeline runs in GitHub Actions (`.github/workflows/ci.yml`).

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string (pooled URL on Vercel/Neon) |
| `AUTH_SECRET` | ✅ | ≥ 16 chars, e.g. `openssl rand -base64 32`. Signs session/reset tokens |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://rentnestlahore.pk` in production (canonicals, sitemaps, OG) |
| `BLOB_READ_WRITE_TOKEN` | ✅ on Vercel | Vercel Blob store for uploaded photos |
| `CRON_SECRET` | ✅ on Vercel | Protects `/api/cron/expire-listings/` (Vercel Cron sends it automatically) |
| `RESEND_API_KEY`, `EMAIL_FROM` | recommended | Password-reset emails via Resend. Without it, reset emails cannot be sent in production |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE` | optional | Shown in footer/contact page |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GTM_ID` | optional | GA4 / GTM. Events: `rental_search`, `filter_apply`, `property_view`, `favorite_toggle`, `whatsapp_click`, `phone_click`, `enquiry_submit`, `property_submit`, `share_click` (no personal data) |
| `NEXT_PUBLIC_GSC_VERIFICATION` | optional | Google Search Console meta-tag token |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | for seeding | First admin account |

No Google Maps key is needed — maps use an OpenStreetMap embed with rounded coordinates.

## Deploying to Vercel

1. **Import the GitHub repo** in Vercel (framework: Next.js). `vercel.json` sets the build command to
   `npm run vercel-build` (`scripts/vercel-build.mjs`: finds the database URL created by the Vercel/Neon integration, runs migrations, builds) and a daily cron.
2. **Database:** Vercel → Storage → create a Postgres database (Neon) and connect it to the project, or use any
   managed PostgreSQL. Make sure `DATABASE_URL` is set for Production and Preview.
   (Use a separate database — or Neon branch — for Preview so previews never touch production data.)
3. **Blob storage:** Vercel → Storage → create a Blob store and connect it (adds `BLOB_READ_WRITE_TOKEN`).
4. **Environment variables:** add `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL=https://rentnestlahore.pk`,
   `CRON_SECRET`, and optionally `RESEND_API_KEY`/`EMAIL_FROM`, analytics IDs.
5. **Deploy.** Migrations run during the build.
6. **Seed once** (from your machine, pointing at the production DB):
   `DATABASE_URL=… SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD=… npm run db:seed`
   (use `db:seed:demo` only on staging; never launch production with demo data).

### Domain (rentnestlahore.pk)

1. Vercel → Project → Settings → Domains → add `rentnestlahore.pk` **and** `www.rentnestlahore.pk`.
2. Set `rentnestlahore.pk` as the primary domain and let Vercel redirect `www` → apex (308).
   The app also redirects `www` → apex itself as a fallback. HTTPS certificates are issued automatically.
3. Vercel then shows the **exact DNS records** to add at your DNS provider / PKNIC. Use exactly what Vercel displays.
   Typically this is an `A` record for `@` and a `CNAME` for `www` — or you can switch the domain's nameservers to Vercel's.
4. After DNS propagates, submit `https://rentnestlahore.pk/sitemap.xml` in Google Search Console.

## Adding real Lahore rental listings

Only use listings you own, are authorised to publish, have licensed, or that landlords/agents submit themselves.
**Never scrape or copy listings, photos, descriptions or phone numbers from other portals.**

1. Remove demo data: `npm run db:remove-demo` (only records with `isDemo = true` are deleted).
2. Add agents/landlords in **Admin → Agents** (tick *Verified* only after you have actually verified them).
3. Add listings via **Admin → Add property**, let landlords submit through **Post Property** (moderated), or
   bulk-import with **Admin → CSV import** (template: `/templates/rentnest-import-template.csv`).
   Always run *Validate (dry run)* first; imported rows default to *Pending Review*.
4. Review the **moderation queue** on the admin dashboard and approve.
5. Keep inventory fresh: listings expire after 90 days by default (cron marks them *Expired*); owners can mark
   properties *Rented*, which removes them from search immediately.

CSV columns: `title, property_type, price, price_frequency, area, area_unit, bedrooms, bathrooms, location, society, address, description, agent_name, agent_phone, whatsapp, images, latitude, longitude, featured, verified, status`
(+ optional `furnished, condition, amenities, security_deposit`). Multiple images/amenities are separated by `|`.

## Security notes

- Passwords: bcrypt (cost 12). Sessions: random 256-bit tokens, stored only as HMAC-SHA256 hashes; httpOnly, SameSite=Lax, Secure in production.
- Authorisation re-checked on the server for every page and action (admin pages 404 for non-admins; users can only modify their own listings).
- Input validation with zod everywhere; Prisma parameterised queries (no SQL injection); React escaping + safe JSON-LD serialisation (no XSS).
- Uploads are decoded with `sharp` (not trusted by extension/MIME), size/dimension limited, stripped of EXIF/GPS and re-encoded to WebP.
- Rate limits on login (per account+IP and per IP), registration, password reset, enquiries, reports, uploads, contact reveals.
- Origin check on JSON/multipart API mutations (Server Actions have Next's built-in origin check).
- Phone numbers are not embedded in page HTML; they're fetched on click through a rate-limited endpoint.
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- The in-memory rate limiter is per server instance; for strict global limits on Vercel swap in Redis/Upstash (`src/lib/rate-limit.ts`).

## Project layout

```
prisma/            schema, migrations, seed
scripts/           CSV import CLI, demo removal, demo image generator
src/app/           routes (public, account, admin, api, sitemaps)
src/components/    UI (property, search, account, admin, layout)
src/content/       rental guides
src/data/          initial taxonomy (types, amenities, Lahore locations)
src/lib/           search, SEO, auth, storage, validation, CSV import, taxonomy
tests/             unit (Vitest) and e2e (Playwright)
```
