/*
  Warnings:

  - The `notes` column on the `RecentlyDeleted` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "followUp" DROP NOT NULL,
ALTER COLUMN "notes" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RecentlyDeleted" ALTER COLUMN "followUp" DROP NOT NULL,
DROP COLUMN "notes",
ADD COLUMN     "notes" JSONB;
