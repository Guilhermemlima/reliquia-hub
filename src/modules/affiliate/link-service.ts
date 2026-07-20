import { getAffiliateProvider } from "@/modules/affiliate/provider";
import type { AffiliateProviderType } from "@prisma/client";

/**
 * Ponto único de geração de link de afiliado. Etapa 4 do plano (provedores
 * automáticos reais) troca o `providerType` recebido e o resto do fluxo
 * continua igual — o núcleo não muda.
 */
export async function generateAffiliateLink(params: {
  providerType: AffiliateProviderType;
  originalUrl: string;
  allowedDomains: string[];
  affiliateIdentifier?: string | null;
}) {
  const provider = getAffiliateProvider(params.providerType);
  return provider.generateAffiliateLink({
    originalUrl: params.originalUrl,
    allowedDomains: params.allowedDomains,
    affiliateIdentifier: params.affiliateIdentifier,
  });
}
