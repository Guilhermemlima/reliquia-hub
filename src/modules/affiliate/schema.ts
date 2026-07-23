import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  allowedDomains: z
    .array(z.string().min(3))
    .min(1, "Informe pelo menos um domínio permitido"),
});
export type StoreInput = z.infer<typeof storeSchema>;

export const programProviderTypes = [
  "MANUAL",
  "API",
  "FEED",
  "LINK_BUILDER",
  "URL_TEMPLATE",
  "CSV",
  "DISABLED",
] as const;

export const programSchema = z.object({
  storeId: z.string().min(1),
  name: z.string().min(2).max(120),
  providerType: z.enum(programProviderTypes).default("MANUAL"),
  affiliateIdentifier: z.string().max(200).optional(),
  commissionDescription: z.string().max(300).optional(),
  cookieDurationDescription: z.string().max(100).optional(),
  termsUrl: z.string().url().optional().or(z.literal("")),
});
export type ProgramInput = z.infer<typeof programSchema>;

export const offerConditions = ["NEW", "USED", "REFURBISHED"] as const;
export const offerAvailabilities = ["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"] as const;

export const offerSchema = z.object({
  partId: z.string().min(1),
  storeId: z.string().min(1),
  affiliateProgramId: z.string().optional(),
  availability: z.enum(offerAvailabilities).default("UNKNOWN"),
  condition: z.enum(offerConditions).default("NEW"),
  /// único link colado pelo admin — precisa já ser o link de afiliado
  /// pronto (ex: gerado no SiteStripe da Amazon). Usado tanto como
  /// `originalUrl` quanto `affiliateUrl` da oferta.
  affiliateUrl: z.string().url("URL de afiliado inválida"),
  /// opcional — preenche na hora sem depender da busca automática (que a
  /// Amazon bloqueia sem a PA-API oficial). Se vazio, fica pendente até
  /// "Atualizar preços" achar um valor ou o admin preencher depois.
  normalPrice: z.coerce.number().positive().optional(),
});
export type OfferInput = z.infer<typeof offerSchema>;

export const setOfferPriceSchema = z.object({
  offerId: z.string().min(1),
  normalPrice: z.coerce.number().positive(),
});
export type SetOfferPriceInput = z.infer<typeof setOfferPriceSchema>;
