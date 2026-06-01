/*
  Warnings:

  - You are about to drop the column `source` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `skills` table. All the data in the column will be lost.
  - Added the required column `name` to the `portfolios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('QUEUED', 'FETCHING_GITHUB', 'PARSING_RESUME', 'GENERATING_PROFILE', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PortfolioStatus" AS ENUM ('DRAFT', 'PROCESSING', 'PUBLISHED', 'ARCHIVED');

-- DropIndex
DROP INDEX "portfolios_userId_key";

-- AlterTable
ALTER TABLE "portfolios" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "status" "PortfolioStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "source",
ADD COLUMN     "featuredOrder" INTEGER,
ADD COLUMN     "sources" "DataSource"[];

-- AlterTable
ALTER TABLE "skills" DROP COLUMN "source",
ADD COLUMN     "sources" "DataSource"[];

-- CreateTable
CREATE TABLE "PortfolioGeneration" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT,
    "githubUsername" TEXT,
    "status" "GenerationStatus" NOT NULL,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portfolios_slug_idx" ON "portfolios"("slug");

-- AddForeignKey
ALTER TABLE "PortfolioGeneration" ADD CONSTRAINT "PortfolioGeneration_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
