/*
  Warnings:

  - Added the required column `adminToken` to the `ServerSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServerSettings" ADD COLUMN     "adminToken" TEXT NOT NULL;
