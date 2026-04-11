-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "alternateNumber" TEXT[];

-- CreateTable
CREATE TABLE "RecentlyDeleted" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "alternateNumber" TEXT[],
    "occupation" TEXT,
    "income" TEXT,
    "residence" TEXT,
    "location" TEXT,
    "interestedProperty" TEXT,
    "propertyType" TEXT,
    "budget" TEXT,
    "visit" TIMESTAMP(3),
    "note" TEXT,
    "followUp" TIMESTAMP(3)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentlyDeleted_pkey" PRIMARY KEY ("id")
);
