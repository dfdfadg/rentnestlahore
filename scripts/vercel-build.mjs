/**
 * Vercel build: picks up the database URL from whichever variable the Vercel/Neon
 * integration created, runs migrations, then builds.
 */
import { execSync } from "node:child_process";

const CANDIDATES = ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"];
const found = CANDIDATES.find((k) => process.env[k]?.trim());
if (!found) {
  console.error(
    "\nâŒ No database connected.\n" +
      "   Vercel â†’ your project â†’ Storage â†’ Create Database (Neon Postgres) â†’ Connect to this project, then Redeploy.\n",
  );
  process.exit(1);
}
const env = { ...process.env, DATABASE_URL: process.env[found] };
if (found !== "DATABASE_URL") console.log(`Using ${found} as DATABASE_URL`);
if (!env.AUTH_SECRET?.trim()) {
  console.error("\nâŒ AUTH_SECRET is missing. Add it in Vercel â†’ Settings â†’ Environment Variables, then Redeploy.\n");
  process.exit(1);
}
const run = (cmd) => execSync(cmd, { stdio: "inherit", env });
run("npx prisma generate");
run("npx prisma migrate deploy");
// Idempotent: upserts property types, amenities and Lahore locations (and the admin if configured)
try {
  // SEED_DEMO=1 also adds the labelled demo listings (skipped if already present)
  run(`npx tsx prisma/seed.ts${process.env.SEED_DEMO?.trim() === "1" ? " --demo" : ""}`);
} catch {
  console.warn("\nâš ï¸  Seeding failed â€” continuing with the build. Check SEED_ADMIN_* variables.\n");
}
run("npx next build");
