/**
 * Vercel build: picks up the database URL from whichever variable the Vercel/Neon
 * integration created, runs migrations, then builds.
 */
import { execSync } from "node:child_process";

const CANDIDATES = ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"];
const found = CANDIDATES.find((k) => process.env[k]?.trim());
if (!found) {
  console.error(
    "\n❌ No database connected.\n" +
      "   Vercel → your project → Storage → Create Database (Neon Postgres) → Connect to this project, then Redeploy.\n",
  );
  process.exit(1);
}
const env = { ...process.env, DATABASE_URL: process.env[found] };
if (found !== "DATABASE_URL") console.log(`Using ${found} as DATABASE_URL`);
if (!env.AUTH_SECRET?.trim()) {
  console.error("\n❌ AUTH_SECRET is missing. Add it in Vercel → Settings → Environment Variables, then Redeploy.\n");
  process.exit(1);
}
const run = (cmd) => execSync(cmd, { stdio: "inherit", env });
run("npx prisma generate");
run("npx prisma migrate deploy");
// Idempotent: upserts property types, amenities and Lahore locations (and the admin if configured)
try {
  run("npx tsx prisma/seed.ts");
} catch {
  console.warn("\n⚠️  Seeding failed — continuing with the build. Check SEED_ADMIN_* variables.\n");
}
run("npx next build");
