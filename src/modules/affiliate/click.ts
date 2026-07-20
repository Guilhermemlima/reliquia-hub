import { prisma } from "@/lib/prisma";

export const clickSourceTypes = ["PRODUCT_PAGE", "BUILDER", "GAME_PAGE", "OTHER"] as const;
export type ClickSourceType = (typeof clickSourceTypes)[number];

export function normalizeSourceType(value: string | null): ClickSourceType {
  const upper = (value ?? "").toUpperCase();
  return (clickSourceTypes as readonly string[]).includes(upper)
    ? (upper as ClickSourceType)
    : "OTHER";
}

/** Deriva um id de sessão anônimo e estável a partir do cookie técnico. */
export function getOrCreateAnonymousSessionId(cookieValue: string | undefined) {
  if (cookieValue) return cookieValue;
  return crypto.randomUUID();
}

export async function recordAffiliateClick(params: {
  offerId: string;
  storeId: string;
  affiliateProgramId?: string | null;
  anonymousSessionId: string;
  sourcePage?: string | null;
  sourceType: ClickSourceType;
  campaign?: string | null;
  deviceType?: string | null;
}) {
  await prisma.affiliateClick.create({
    data: {
      offerId: params.offerId,
      storeId: params.storeId,
      affiliateProgramId: params.affiliateProgramId ?? undefined,
      anonymousSessionId: params.anonymousSessionId,
      sourcePage: params.sourcePage ?? undefined,
      sourceType: params.sourceType,
      campaign: params.campaign ?? undefined,
      deviceType: params.deviceType ?? undefined,
    },
  });
}
