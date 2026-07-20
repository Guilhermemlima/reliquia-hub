import type { AffiliateProviderType } from "@prisma/client";
import { isUrlAllowedForStore } from "@/modules/affiliate/domain-validation";

export type ProviderValidationResult = { valid: boolean; message?: string };
export type ConnectionTestResult = { success: boolean; message: string };

export type ExternalProduct = {
  externalId: string;
  title: string;
  price?: number;
  imageUrl?: string;
  url: string;
};

export type GenerateAffiliateLinkInput = {
  originalUrl: string;
  allowedDomains: string[];
  affiliateIdentifier?: string | null;
};

export type AffiliateLinkResult =
  | { status: "generated"; url: string }
  | { status: "manual_required"; reason: string }
  | { status: "invalid"; reason: string };

/**
 * Interface comum que qualquer loja/rede de afiliados deve implementar.
 * Hoje só `ManualAffiliateProvider` existe de verdade — provedores
 * automáticos (Amazon, Awin, Mercado Livre...) entram depois implementando
 * esta mesma interface, sem precisar alterar o núcleo (`link-service.ts`,
 * rotas, painel admin).
 */
export interface AffiliateProvider {
  readonly providerType: AffiliateProviderType;
  readonly providerName: string;

  validateConfiguration(): Promise<ProviderValidationResult>;
  searchProducts(query: string): Promise<ExternalProduct[]>;
  getProduct(externalProductId: string): Promise<ExternalProduct | null>;
  generateAffiliateLink(
    input: GenerateAffiliateLinkInput
  ): Promise<AffiliateLinkResult>;
  testConnection(): Promise<ConnectionTestResult>;
}

/**
 * Provedor universal: o administrador cola a URL de afiliado já pronta (ou
 * deixa a URL original, se ainda não tiver o link rastreável). Não depende
 * de nenhuma credencial — funciona com qualquer loja.
 */
export class ManualAffiliateProvider implements AffiliateProvider {
  readonly providerType: AffiliateProviderType = "MANUAL";
  readonly providerName = "Manual";

  async validateConfiguration(): Promise<ProviderValidationResult> {
    return { valid: true };
  }

  async searchProducts(): Promise<ExternalProduct[]> {
    return [];
  }

  async getProduct(): Promise<ExternalProduct | null> {
    return null;
  }

  async generateAffiliateLink(
    input: GenerateAffiliateLinkInput
  ): Promise<AffiliateLinkResult> {
    const check = isUrlAllowedForStore(input.originalUrl, input.allowedDomains);
    if (!check.ok) {
      return { status: "invalid", reason: check.error };
    }
    // Sem API de geração automática: o link "gerado" é a própria URL
    // informada — o admin é quem garante que já é uma URL de afiliado.
    return { status: "generated", url: input.originalUrl };
  }

  async testConnection(): Promise<ConnectionTestResult> {
    return {
      success: true,
      message: "Modo manual não depende de conexão externa.",
    };
  }
}

/** Provedores automáticos entram aqui quando forem implementados. */
const providerRegistry: Partial<Record<AffiliateProviderType, AffiliateProvider>> = {
  MANUAL: new ManualAffiliateProvider(),
};

export function getAffiliateProvider(
  type: AffiliateProviderType
): AffiliateProvider {
  const provider = providerRegistry[type];
  if (!provider) {
    // Fallback seguro: nunca inventamos um provedor — caímos para manual.
    return providerRegistry.MANUAL as AffiliateProvider;
  }
  return provider;
}
