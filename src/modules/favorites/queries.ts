import { prisma } from "@/lib/prisma";

export async function isFavorited(userId: string | undefined, listingId: string) {
  if (!userId) return false;
  const favorite = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });
  return Boolean(favorite);
}

export async function getUserFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          category: true,
          seller: {
            select: {
              id: true,
              name: true,
              image: true,
              sellerProfile: {
                select: {
                  slug: true,
                  storeName: true,
                  verified: true,
                  ratingAvg: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
