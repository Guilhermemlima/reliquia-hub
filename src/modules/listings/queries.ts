import { prisma } from "@/lib/prisma";

const listingCardInclude = {
  images: { orderBy: { order: "asc" as const }, take: 1 },
  category: true,
  seller: {
    select: {
      id: true,
      name: true,
      image: true,
      sellerProfile: {
        select: { slug: true, storeName: true, verified: true, ratingAvg: true },
      },
    },
  },
};

export async function getListingBySlug(slug: string) {
  return prisma.listing.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
          sellerProfile: true,
        },
      },
    },
  });
}

export async function getListingById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } }, category: true },
  });
}

export async function incrementViewCount(id: string) {
  return prisma.listing.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

export async function getFeaturedListings(limit = 8) {
  return prisma.listing.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: listingCardInclude,
  });
}

export async function getLatestListings(limit = 12) {
  return prisma.listing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: listingCardInclude,
  });
}

export async function getRelatedListings(
  categoryId: string,
  excludeId: string,
  limit = 4
) {
  return prisma.listing.findMany({
    where: { categoryId, status: "ACTIVE", id: { not: excludeId } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: listingCardInclude,
  });
}

export async function getSellerListings(
  sellerId: string,
  status?: "DRAFT" | "ACTIVE" | "SOLD" | "REMOVED" | "FLAGGED"
) {
  return prisma.listing.findMany({
    where: { sellerId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { order: "asc" }, take: 1 }, category: true },
  });
}

export async function getPublicSellerListings(sellerId: string, limit = 24) {
  return prisma.listing.findMany({
    where: { sellerId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: listingCardInclude,
  });
}

export type ListingCard = Awaited<ReturnType<typeof getFeaturedListings>>[number];
