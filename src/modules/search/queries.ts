import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/redis";
import type { SearchFilters } from "@/modules/search/schema";

const PAGE_SIZE = 24;

export async function searchListings(filters: SearchFilters) {
  const cacheKey = `search:${JSON.stringify(filters)}`;

  return cached(cacheKey, 60, async () => {
    const where: Prisma.ListingWhereInput = {
      status: "ACTIVE",
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: "insensitive" } },
              { description: { contains: filters.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters.category ? { category: { slug: filters.category } } : {}),
      ...(filters.condition ? { condition: filters.condition as never } : {}),
      ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
        ? {
            price: {
              ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
              ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
            },
          }
        : {}),
    };

    const orderBy: Prisma.ListingOrderByWithRelationInput =
      filters.sort === "price_asc"
        ? { price: "asc" }
        : filters.sort === "price_desc"
          ? { price: "desc" }
          : filters.sort === "newest"
            ? { createdAt: "desc" }
            : { viewCount: "desc" };

    const skip = (filters.page - 1) * PAGE_SIZE;

    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: PAGE_SIZE,
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
      }),
      prisma.listing.count({ where }),
    ]);

    return { items, total, pageSize: PAGE_SIZE, page: filters.page };
  });
}
