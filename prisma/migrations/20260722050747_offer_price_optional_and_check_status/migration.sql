-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "lastPriceCheckStatus" TEXT DEFAULT 'NEVER',
ALTER COLUMN "normalPrice" DROP NOT NULL;
