import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, sellers, categories] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
      take: 5000,
    }),
    prisma.sellerProfile.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true } }),
  ]);

  return [
    { url: APP_URL, changeFrequency: "daily", priority: 1 },
    { url: `${APP_URL}/search`, changeFrequency: "hourly", priority: 0.8 },
    ...categories.map((category) => ({
      url: `${APP_URL}/search?category=${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    ...listings.map((listing) => ({
      url: `${APP_URL}/listings/${listing.slug}`,
      lastModified: listing.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...sellers.map((seller) => ({
      url: `${APP_URL}/seller/${seller.slug}`,
      lastModified: seller.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
