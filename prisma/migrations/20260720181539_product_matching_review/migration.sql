-- CreateEnum
CREATE TYPE "OfferMatchReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Part" ADD COLUMN     "ean" TEXT,
ADD COLUMN     "mpn" TEXT;

-- CreateTable
CREATE TABLE "OfferMatchReview" (
    "id" TEXT NOT NULL,
    "rawLabel" TEXT NOT NULL,
    "candidatePartId" TEXT,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "matchMethod" TEXT NOT NULL,
    "status" "OfferMatchReviewStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferMatchReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfferMatchReview_status_idx" ON "OfferMatchReview"("status");

-- CreateIndex
CREATE INDEX "Part_ean_idx" ON "Part"("ean");

-- CreateIndex
CREATE INDEX "Part_mpn_idx" ON "Part"("mpn");

-- AddForeignKey
ALTER TABLE "OfferMatchReview" ADD CONSTRAINT "OfferMatchReview_candidatePartId_fkey" FOREIGN KEY ("candidatePartId") REFERENCES "Part"("id") ON DELETE SET NULL ON UPDATE CASCADE;
