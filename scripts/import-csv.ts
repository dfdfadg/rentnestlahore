/**
 * CLI: validate or import a CSV of authorised rental listings.
 *   npm run import:csv -- path/to/file.csv            (validate only — dry run)
 *   npm run import:csv -- path/to/file.csv --import   (write to the database)
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { importCsv } from "../src/lib/csv-import";

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: npm run import:csv -- <file.csv> [--import] [--demo]");
    process.exit(1);
  }
  const prisma = new PrismaClient();
  const dryRun = !process.argv.includes("--import");
  const report = await importCsv(readFileSync(file, "utf8"), { dryRun, markDemo: process.argv.includes("--demo"), prisma });
  console.log(`${dryRun ? "[dry run] " : ""}rows: ${report.total}, valid: ${report.valid}, imported: ${report.imported}, errors: ${report.errors.length}`);
  for (const e of report.errors) console.log(`  row ${e.row}: ${e.messages.join("; ")}`);
  await prisma.$disconnect();
  if (report.errors.length) process.exitCode = 2;
}

main();
