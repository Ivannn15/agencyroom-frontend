/*
  Warnings:

  - The primary key for the `ClientInvite` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ClientInvite" DROP CONSTRAINT "ClientInvite_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ClientInvite_pkey" PRIMARY KEY ("id");
