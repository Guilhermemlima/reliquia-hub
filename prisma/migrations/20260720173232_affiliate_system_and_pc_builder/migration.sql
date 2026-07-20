-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AffiliateProviderType" AS ENUM ('MANUAL', 'API', 'FEED', 'LINK_BUILDER', 'URL_TEMPLATE', 'CSV', 'DISABLED');

-- CreateEnum
CREATE TYPE "AffiliateProgramStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "PartCategory" AS ENUM ('CPU', 'GPU', 'RAM', 'STORAGE', 'PSU', 'MOTHERBOARD', 'CASE', 'COOLER', 'MONITOR');

-- CreateEnum
CREATE TYPE "OfferAvailability" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "OfferCondition" AS ENUM ('NEW', 'USED', 'REFURBISHED');

-- CreateEnum
CREATE TYPE "OfferSource" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "ClickSourceType" AS ENUM ('PRODUCT_PAGE', 'BUILDER', 'GAME_PAGE', 'OTHER');

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "allowedDomains" TEXT[],
    "status" "StoreStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateProgram" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerType" "AffiliateProviderType" NOT NULL DEFAULT 'MANUAL',
    "status" "AffiliateProgramStatus" NOT NULL DEFAULT 'ACTIVE',
    "affiliateIdentifier" TEXT,
    "configuration" JSONB,
    "encryptedCredentials" TEXT,
    "commissionDescription" TEXT,
    "cookieDurationDescription" TEXT,
    "termsUrl" TEXT,
    "lastConnectionTest" TIMESTAMP(3),
    "lastSync" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "category" "PartCategory" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "specs" JSONB NOT NULL DEFAULT '{}',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "affiliateProgramId" TEXT,
    "sellerName" TEXT,
    "normalPrice" DECIMAL(10,2) NOT NULL,
    "pixPrice" DECIMAL(10,2),
    "installmentPrice" DECIMAL(10,2),
    "installmentCount" INTEGER,
    "shippingPrice" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "availability" "OfferAvailability" NOT NULL DEFAULT 'UNKNOWN',
    "condition" "OfferCondition" NOT NULL DEFAULT 'NEW',
    "originalUrl" TEXT NOT NULL,
    "affiliateUrl" TEXT,
    "externalOfferId" TEXT,
    "source" "OfferSource" NOT NULL DEFAULT 'MANUAL',
    "status" "OfferStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferPriceHistory" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "normalPrice" DECIMAL(10,2) NOT NULL,
    "pixPrice" DECIMAL(10,2),
    "shippingPrice" DECIMAL(10,2),
    "availability" "OfferAvailability" NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateClick" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "affiliateProgramId" TEXT,
    "anonymousSessionId" TEXT NOT NULL,
    "sourcePage" TEXT,
    "sourceType" "ClickSourceType" NOT NULL DEFAULT 'OTHER',
    "campaign" TEXT,
    "deviceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameRecommendedPart" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "targetFps" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRecommendedPart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- CreateIndex
CREATE INDEX "AffiliateProgram_storeId_idx" ON "AffiliateProgram"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Part_slug_key" ON "Part"("slug");

-- CreateIndex
CREATE INDEX "Part_category_idx" ON "Part"("category");

-- CreateIndex
CREATE INDEX "Offer_partId_status_idx" ON "Offer"("partId", "status");

-- CreateIndex
CREATE INDEX "Offer_storeId_idx" ON "Offer"("storeId");

-- CreateIndex
CREATE INDEX "OfferPriceHistory_offerId_capturedAt_idx" ON "OfferPriceHistory"("offerId", "capturedAt");

-- CreateIndex
CREATE INDEX "AffiliateClick_offerId_idx" ON "AffiliateClick"("offerId");

-- CreateIndex
CREATE INDEX "AffiliateClick_storeId_createdAt_idx" ON "AffiliateClick"("storeId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- CreateIndex
CREATE INDEX "GameRecommendedPart_gameId_resolution_targetFps_idx" ON "GameRecommendedPart"("gameId", "resolution", "targetFps");

-- AddForeignKey
ALTER TABLE "AffiliateProgram" ADD CONSTRAINT "AffiliateProgram_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_affiliateProgramId_fkey" FOREIGN KEY ("affiliateProgramId") REFERENCES "AffiliateProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferPriceHistory" ADD CONSTRAINT "OfferPriceHistory_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateClick" ADD CONSTRAINT "AffiliateClick_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateClick" ADD CONSTRAINT "AffiliateClick_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRecommendedPart" ADD CONSTRAINT "GameRecommendedPart_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRecommendedPart" ADD CONSTRAINT "GameRecommendedPart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;
