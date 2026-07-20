import { prisma } from "@/lib/prisma";
import { PART_CATEGORY_LABELS } from "@/modules/parts/queries";

/** Ofertas sem verificação de preço há mais de N dias contam como desatualizadas. */
export const STALE_OFFER_DAYS = 7;

export async function getClickReport() {
  const [byDevice, bySourceType, byCampaign, last14Days, topOffers] = await Promise.all([
    prisma.affiliateClick.groupBy({
      by: ["deviceType"],
      _count: { _all: true },
      orderBy: { _count: { deviceType: "desc" } },
    }),
    prisma.affiliateClick.groupBy({
      by: ["sourceType"],
      _count: { _all: true },
      orderBy: { _count: { sourceType: "desc" } },
    }),
    prisma.affiliateClick.groupBy({
      by: ["campaign"],
      _count: { _all: true },
      where: { campaign: { not: null } },
      orderBy: { _count: { campaign: "desc" } },
      take: 10,
    }),
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', "createdAt") as day, count(*)::bigint as count
      FROM "AffiliateClick"
      WHERE "createdAt" >= now() - interval '14 days'
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.affiliateClick.groupBy({
      by: ["offerId"],
      _count: { _all: true },
      orderBy: { _count: { offerId: "desc" } },
      take: 10,
    }),
  ]);

  const offers = await prisma.offer.findMany({
    where: { id: { in: topOffers.map((o) => o.offerId) } },
    include: { part: true, store: true },
  });
  const offerById = new Map(offers.map((o) => [o.id, o]));

  return {
    byDevice: byDevice.map((d) => ({
      device: d.deviceType ?? "desconhecido",
      count: d._count._all,
    })),
    bySourceType: bySourceType.map((s) => ({
      source: s.sourceType,
      count: s._count._all,
    })),
    byCampaign: byCampaign.map((c) => ({
      campaign: c.campaign ?? "—",
      count: c._count._all,
    })),
    last14Days: last14Days.map((d) => ({
      day: d.day.toISOString().slice(0, 10),
      count: Number(d.count),
    })),
    topOffers: topOffers
      .map((t) => {
        const offer = offerById.get(t.offerId);
        if (!offer) return null;
        return {
          offerId: t.offerId,
          clicks: t._count._all,
          partName: `${PART_CATEGORY_LABELS[offer.part.category] ?? offer.part.category} — ${offer.part.name}`,
          storeName: offer.store.name,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null),
  };
}

export async function getOfferHealthReport() {
  const staleThreshold = new Date(Date.now() - STALE_OFFER_DAYS * 24 * 60 * 60 * 1000);

  const [statusCounts, staleOffers, allParts, partsWithActiveOffer] = await Promise.all([
    prisma.offer.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.offer.findMany({
      where: { status: "ACTIVE", lastCheckedAt: { lt: staleThreshold } },
      include: { part: true, store: true },
      orderBy: { lastCheckedAt: "asc" },
      take: 20,
    }),
    prisma.part.findMany({ select: { id: true, name: true, category: true } }),
    prisma.offer.findMany({
      where: { status: "ACTIVE" },
      select: { partId: true },
      distinct: ["partId"],
    }),
  ]);

  const partsWithOfferIds = new Set(partsWithActiveOffer.map((o) => o.partId));
  const partsWithoutOffer = allParts.filter((p) => !partsWithOfferIds.has(p.id));

  return {
    statusCounts: statusCounts.map((s) => ({ status: s.status, count: s._count._all })),
    staleOffers: staleOffers.map((o) => ({
      id: o.id,
      partName: `${PART_CATEGORY_LABELS[o.part.category] ?? o.part.category} — ${o.part.name}`,
      storeName: o.store.name,
      lastCheckedAt: o.lastCheckedAt.toISOString(),
    })),
    partsWithoutOffer: partsWithoutOffer.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
    })),
  };
}
