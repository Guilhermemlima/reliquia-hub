import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  const [users, listings, activeListings, orders, openReports] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
  ]);

  return { users, listings, activeListings, orders, openReports };
}

export async function getAllListingsForModeration() {
  return prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
      seller: { select: { name: true, email: true } },
      category: { select: { name: true } },
    },
  });
}

export async function getAllReports() {
  return prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { name: true, email: true } },
      listing: { select: { title: true, slug: true } },
      targetUser: { select: { name: true, email: true } },
    },
  });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      sellerProfile: { select: { verified: true, storeName: true } },
    },
  });
}
