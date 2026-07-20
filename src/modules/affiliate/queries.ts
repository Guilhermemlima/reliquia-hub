import { prisma } from "@/lib/prisma";

export async function getStores() {
  return prisma.store.findMany({
    orderBy: { name: "asc" },
    include: { programs: true, _count: { select: { offers: true } } },
  });
}

export async function getStoreById(id: string) {
  return prisma.store.findUnique({ where: { id } });
}

export async function getActiveStores() {
  return prisma.store.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });
}

export async function getProgramsByStore(storeId: string) {
  return prisma.affiliateProgram.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllPrograms() {
  return prisma.affiliateProgram.findMany({
    orderBy: { createdAt: "desc" },
    include: { store: true, _count: { select: { offers: true } } },
  });
}

export async function getOffersForPart(partId: string) {
  return prisma.offer.findMany({
    where: { partId, status: "ACTIVE" },
    orderBy: { normalPrice: "asc" },
    include: { store: true },
  });
}

export async function getOfferById(id: string) {
  return prisma.offer.findUnique({
    where: { id },
    include: { store: true, part: true, affiliateProgram: true },
  });
}

export async function getAllOffers() {
  return prisma.offer.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      store: true,
      part: true,
      _count: { select: { clicks: true } },
    },
  });
}

export async function getClickStats() {
  const [totalClicks, byStore] = await Promise.all([
    prisma.affiliateClick.count(),
    prisma.affiliateClick.groupBy({
      by: ["storeId"],
      _count: { _all: true },
      orderBy: { _count: { storeId: "desc" } },
    }),
  ]);

  const stores = await prisma.store.findMany({
    where: { id: { in: byStore.map((s) => s.storeId) } },
    select: { id: true, name: true },
  });
  const storeName = new Map(stores.map((s) => [s.id, s.name]));

  return {
    totalClicks,
    byStore: byStore.map((s) => ({
      storeId: s.storeId,
      storeName: storeName.get(s.storeId) ?? "—",
      clicks: s._count._all,
    })),
  };
}
