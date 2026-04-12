/*
  Warnings:

  - Changed the type of `note` on the `Client` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "note",
ADD COLUMN     "note" JSONB NOT NULL;
