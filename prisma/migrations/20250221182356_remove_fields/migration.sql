/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
