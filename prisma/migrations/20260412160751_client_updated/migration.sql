/*
  Warnings:

  - The `note` column on the `Client` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `note` column on the `RecentlyDeleted` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `followUp` on the `Client` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `followUp` on the `RecentlyDeleted` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "followUp",
ADD COLUMN     "followUp" JSONB NOT NULL,
DROP COLUMN "note",
ADD COLUMN     "note" TEXT[];

-- AlterTable
ALTER TABLE "RecentlyDeleted" DROP COLUMN "note",
ADD COLUMN     "note" TEXT[],
DROP COLUMN "followUp",
ADD COLUMN     "followUp" JSONB NOT NULL;
