import { prisma } from "@/lib/prisma";

type OfferWithStore = {
  id: string;
  partId: string;
  storeId: string;
  storeName: string;
  normalPrice: number;
  pixPrice: number | null;
  lastCheckedAt: Date;
};

export type BuildItem = {
  partId: string;
  offerId: string;
  storeId: string;
  storeName: string;
  price: number;
};

export type BuildStrategy = {
  items: BuildItem[];
  totalPrice: number;
  storeCount: number;
};

export type BuildStrategiesResult =
  | { ok: true; cheapest: BuildStrategy; fewestStores: BuildStrategy; balanced: BuildStrategy }
  | { ok: false; missingPartIds: string[] };

/** Penalidade (em R$) atribuída por loja extra na estratégia "melhor equilíbrio". */
const BALANCE_STORE_PENALTY = 80;

function summarize(items: BuildItem[]): BuildStrategy {
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const storeCount = new Set(items.map((i) => i.storeId)).size;
  return { items, totalPrice, storeCount };
}

function balancedScore(strategy: BuildStrategy) {
  return strategy.totalPrice + (strategy.storeCount - 1) * BALANCE_STORE_PENALTY;
}

export async function computeStrategies(
  partIds: string[]
): Promise<BuildStrategiesResult> {
  const offers = await prisma.offer.findMany({
    where: { partId: { in: partIds }, status: "ACTIVE" },
    include: { store: true },
    orderBy: { normalPrice: "asc" },
  });

  const offersByPart = new Map<string, OfferWithStore[]>();
  for (const offer of offers) {
    const list = offersByPart.get(offer.partId) ?? [];
    list.push({
      id: offer.id,
      partId: offer.partId,
      storeId: offer.storeId,
      storeName: offer.store.name,
      normalPrice: Number(offer.normalPrice),
      pixPrice: offer.pixPrice ? Number(offer.pixPrice) : null,
      lastCheckedAt: offer.lastCheckedAt,
    });
    offersByPart.set(offer.partId, list);
  }

  const missingPartIds = partIds.filter((id) => !offersByPart.get(id)?.length);
  if (missingPartIds.length > 0) {
    return { ok: false, missingPartIds };
  }

  // Estratégia 1: mais barato — menor preço por peça, ignorando loja.
  const cheapestItems: BuildItem[] = partIds.map((partId) => {
    const cheapest = offersByPart.get(partId)![0];
    return {
      partId,
      offerId: cheapest.id,
      storeId: cheapest.storeId,
      storeName: cheapest.storeName,
      price: cheapest.normalPrice,
    };
  });
  const cheapest = summarize(cheapestItems);

  // Candidatos "loja primária": para cada loja que aparece em pelo menos uma
  // oferta, tenta concentrar a compra nela e usa a oferta mais barata de
  // outra loja só para as peças que essa loja não vende.
  const allStoreIds = new Set(offers.map((o) => o.storeId));
  const candidates: BuildStrategy[] = [cheapest];

  for (const primaryStoreId of allStoreIds) {
    const items: BuildItem[] = partIds.map((partId) => {
      const partOffers = offersByPart.get(partId)!;
      const fromPrimary = partOffers.find((o) => o.storeId === primaryStoreId);
      const chosen = fromPrimary ?? partOffers[0];
      return {
        partId,
        offerId: chosen.id,
        storeId: chosen.storeId,
        storeName: chosen.storeName,
        price: chosen.normalPrice,
      };
    });
    candidates.push(summarize(items));
  }

  // Estratégia 2: menos lojas — menor número de lojas distintas; empate
  // resolvido pelo menor preço total.
  const fewestStores = [...candidates].sort(
    (a, b) => a.storeCount - b.storeCount || a.totalPrice - b.totalPrice
  )[0];

  // Estratégia 3: melhor equilíbrio — pondera preço total contra o número
  // de lojas (cada loja extra "custa" BALANCE_STORE_PENALTY na comparação).
  const balanced = [...candidates].sort(
    (a, b) => balancedScore(a) - balancedScore(b)
  )[0];

  return { ok: true, cheapest, fewestStores, balanced };
}
