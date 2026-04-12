/*
  Warnings:

  - You are about to drop the column `note` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `RecentlyDeleted` table. All the data in the column will be lost.
  - Added the required column `notes` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "note",
ADD COLUMN     "notes" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "RecentlyDeleted" DROP COLUMN "note",
ADD COLUMN     "notes" TEXT[];
