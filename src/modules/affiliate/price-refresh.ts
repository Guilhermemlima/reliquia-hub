import { prisma } from "@/lib/prisma";
import { fetchPriceHint } from "@/modules/affiliate/price-fetch";

const CONCURRENCY = 6;

export type PriceRefreshSummary = {
  checked: number;
  updated: number;
  notFound: number;
  suspicious: number;
  errors: number;
};

/**
 * Guarda contra falso-positivo do best-effort: se a página tinha algum outro
 * valor "price" (banner, produto errado, cache antigo) e o novo número foge
 * demais do último preço conhecido, não sobrescreve sozinho — fica marcado
 * pra revisão manual em vez de virar um preço absurdo no site.
 */
const MAX_PRICE_JUMP_RATIO = 3;
const MIN_PRICE_DROP_RATIO = 0.2;

function isPlausiblePriceChange(previous: number | null, next: number) {
  if (previous === null || previous <= 0) return true;
  const ratio = next / previous;
  return ratio <= MAX_PRICE_JUMP_RATIO && ratio >= MIN_PRICE_DROP_RATIO;
}

/**
 * Roda o melhor-esforço de atualização de preço pra todas as ofertas ativas
 * de uma vez (botão "Atualizar preços" em /admin/afiliados/ofertas). Cada
 * oferta que encontra um preço novo ganha uma entrada em OfferPriceHistory
 * (usada pra calcular maior preço/desconto na exibição) e tem `normalPrice`
 * atualizado. Ofertas onde a página não expôs preço (ex: Amazon sem API)
 * ficam como estavam — não é tratado como erro, só marcado NOT_FOUND.
 */
export async function refreshAllOfferPrices(): Promise<PriceRefreshSummary> {
  const offers = await prisma.offer.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      affiliateUrl: true,
      originalUrl: true,
      availability: true,
      shippingPrice: true,
      pixPrice: true,
      normalPrice: true,
    },
  });

  const summary: PriceRefreshSummary = { checked: 0, updated: 0, notFound: 0, suspicious: 0, errors: 0 };
  let next = 0;

  async function worker() {
    while (next < offers.length) {
      const offer = offers[next++];
      summary.checked++;
      const url = offer.affiliateUrl || offer.originalUrl;
      try {
        const hint = await fetchPriceHint(url);
        if (!hint) {
          await prisma.offer.update({
            where: { id: offer.id },
            data: { lastPriceCheckStatus: "NOT_FOUND", lastCheckedAt: new Date() },
          });
          summary.notFound++;
          continue;
        }

        const previousPrice = offer.normalPrice ? Number(offer.normalPrice) : null;
        if (!isPlausiblePriceChange(previousPrice, hint.price)) {
          await prisma.offer.update({
            where: { id: offer.id },
            data: { lastPriceCheckStatus: "SUSPICIOUS", lastCheckedAt: new Date() },
          });
          summary.suspicious++;
          continue;
        }

        await prisma.$transaction([
          prisma.offer.update({
            where: { id: offer.id },
            data: {
              normalPrice: hint.price,
              lastPriceCheckStatus: "OK",
              lastCheckedAt: new Date(),
            },
          }),
          prisma.offerPriceHistory.create({
            data: {
              offerId: offer.id,
              normalPrice: hint.price,
              pixPrice: offer.pixPrice ?? undefined,
              shippingPrice: offer.shippingPrice ?? undefined,
              availability: offer.availability,
            },
          }),
        ]);
        summary.updated++;
      } catch {
        await prisma.offer.update({
          where: { id: offer.id },
          data: { lastPriceCheckStatus: "ERROR", lastCheckedAt: new Date() },
        }).catch(() => {});
        summary.errors++;
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return summary;
}

export type OfferPriceStats = {
  current: number | null;
  highest: number | null;
  discountPercent: number | null;
};

export function computeOfferPriceStats(
  normalPrice: number | null,
  priceHistory: { normalPrice: number }[]
): OfferPriceStats {
  const historyMax = priceHistory.length > 0 ? Math.max(...priceHistory.map((h) => h.normalPrice)) : null;
  const highest = historyMax !== null && normalPrice !== null ? Math.max(historyMax, normalPrice) : historyMax ?? normalPrice;

  if (normalPrice === null || highest === null || highest <= normalPrice) {
    return { current: normalPrice, highest, discountPercent: null };
  }

  const discountPercent = Math.round(((highest - normalPrice) / highest) * 100);
  return { current: normalPrice, highest, discountPercent };
}
