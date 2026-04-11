/*
  Warnings:

  - Added the required column `number` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stage` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "budget" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "followUp" TIMESTAMP(3),
ADD COLUMN     "income" TEXT,
ADD COLUMN     "interestedProperty" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "number" TEXT NOT NULL,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "propertyType" TEXT,
ADD COLUMN     "residence" TEXT,
ADD COLUMN     "stage" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "visit" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "units" TEXT[],
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);
