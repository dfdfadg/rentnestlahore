-- CreateEnum
CREATE TYPE "LeadIntent" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'FORWARDED', 'CONVERTED', 'CLOSED', 'SPAM');

-- CreateTable
CREATE TABLE "PropertyLead" (
    "id" TEXT NOT NULL,
    "intent" "LeadIntent" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "propertyType" TEXT,
    "area" TEXT NOT NULL,
    "size" TEXT,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "timeline" TEXT,
    "notes" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "forwardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyLead_status_createdAt_idx" ON "PropertyLead"("status", "createdAt");
