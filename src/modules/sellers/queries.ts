import { prisma } from "@/lib/prisma";

export async function getSellerProfileByUserId(userId: string) {
  return prisma.sellerProfile.findUnique({ where: { userId } });
}

export async function getSellerBySlug(slug: string) {
  return prisma.sellerProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: { id: true, name: true, image: true, createdAt: true },
      },
    },
  });
}

export async function getSellerReviews(userId: string, limit = 20) {
  return prisma.review.findMany({
    where: { targetId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      author: { select: { name: true, image: true } },
      order: { select: { listing: { select: { title: true, slug: true } } } },
    },
  });
}
