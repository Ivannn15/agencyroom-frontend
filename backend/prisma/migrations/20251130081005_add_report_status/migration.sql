-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('draft', 'published');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'draft';
