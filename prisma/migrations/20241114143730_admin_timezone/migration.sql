/*
  Warnings:

  - Changed the type of `adminTimezone` on the `ServerSettings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ServerSettings" DROP COLUMN "adminTimezone",
ADD COLUMN     "adminTimezone" INTEGER NOT NULL;
