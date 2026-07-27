-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false;
