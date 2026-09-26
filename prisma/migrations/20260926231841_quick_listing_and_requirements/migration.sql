-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('NEW', 'CONTACTED', 'MATCHED', 'CLOSED', 'SPAM');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'account';

-- CreateTable
CREATE TABLE "RentRequirement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "propertyType" TEXT,
    "areas" TEXT NOT NULL,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "bedrooms" INTEGER,
    "moveIn" TEXT,
    "notes" TEXT,
    "status" "RequirementStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RentRequirement_status_createdAt_idx" ON "RentRequirement"("status", "createdAt");
