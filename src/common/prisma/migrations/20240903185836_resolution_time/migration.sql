/*
  Warnings:

  - The `resolutionTime` column on the `complaints` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "complaints" DROP COLUMN "resolutionTime",
ADD COLUMN     "resolutionTime" TIMESTAMPTZ(6);
