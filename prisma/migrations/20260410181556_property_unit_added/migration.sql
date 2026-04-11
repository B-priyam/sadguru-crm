/*
  Warnings:

  - The `units` column on the `Property` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PropertyUnit" AS ENUM ('TYPE', 'PRICE');

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "units",
ADD COLUMN     "units" "PropertyUnit"[];
