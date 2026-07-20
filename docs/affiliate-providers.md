# Provedores de afiliados

## Como funciona hoje

Todo o sistema fala com lojas parceiras através de uma única interface,
`AffiliateProvider` (`src/modules/affiliate/provider.ts`):

```ts
export interface AffiliateProvider {
  readonly providerType: AffiliateProviderType;
  readonly providerName: string;

  validateConfiguration(): Promise<ProviderValidationResult>;
  searchProducts(query: string): Promise<ExternalProduct[]>;
  getProduct(externalProductId: string): Promise<ExternalProduct | null>;
  generateAffiliateLink(input: GenerateAffiliateLinkInput): Promise<AffiliateLinkResult>;
  testConnection(): Promise<ConnectionTestResult>;
}
```

Hoje só existe uma implementação real: `ManualAffiliateProvider`. Ela não
depende de nenhuma credencial — `generateAffiliateLink` só valida o domínio
(`isUrlAllowedForStore`) e devolve a própria URL informada pelo admin como
"link gerado". `searchProducts`/`getProduct` retornam vazio porque não há
nenhuma API para consultar.

O núcleo do sistema (rota `/go/[offerId]`, painel admin, montador,
importação CSV) só conhece essa interface — nunca fala com "Amazon" ou
"Awin" diretamente. Isso é o que permite plugar um provedor automático sem
tocar em nada disso.

## Tipos de integração já modelados no schema

`AffiliateProgram.providerType` aceita (`prisma/schema.prisma`):

| Valor | Significado | Implementado? |
| --- | --- | --- |
| `MANUAL` | Admin cola o link | ✅ |
| `API` | API oficial da loja/rede | ❌ (reservado) |
| `FEED` | Feed XML/CSV/JSON de produtos | ❌ (reservado) |
| `LINK_BUILDER` | Endpoint que transforma URL normal em link rastreável | ❌ (reservado) |
| `URL_TEMPLATE` | Padrão de URL documentado oficialmente pela rede | ❌ (reservado) |
| `CSV` | Importação manual em lote | ✅ (`modules/affiliate/import-service.ts`, não é bem um "provider", é um fluxo de importação) |
| `DISABLED` | Programa cadastrado mas desligado | ✅ (estado válido, sem lógica especial) |

## Como adicionar um provedor automático de verdade

**Nunca invente endpoints, tokens ou parâmetros de link.** Só implemente
contra a documentação oficial da rede/loja, com credenciais reais em mãos.

1. Crie `src/modules/affiliate/providers/<nome>.ts` implementando
   `AffiliateProvider`. Use `ManualAffiliateProvider` como referência de
   forma, não de conteúdo.
2. Adicione as variáveis de ambiente necessárias no `.env.example` (só os
   nomes, nunca valores) — ver `docs/affiliate-security.md`.
3. Registre o provedor em `getAffiliateProvider()` (`provider.ts`), mapeando
   o `AffiliateProviderType` correspondente.
4. Se a rede permitir busca de produtos, implemente `searchProducts`/
   `getProduct` de verdade — isso é o que vai permitir, no futuro,
   `ExternalProduct`/`ProductMapping` (associação automática de catálogo
   completo, não só por linha de CSV como hoje).
5. Implemente `generateAffiliateLink` seguindo exatamente o mecanismo
   documentado pela rede (parâmetro de tracking, endpoint de link builder,
   etc). Sempre valide o domínio final com `isUrlAllowedForStore` antes de
   devolver a URL.
6. Implemente `testConnection` fazendo uma chamada real e barata à API
   (ex: endpoint de "quem sou eu"/status) para o botão "Testar conexão" no
   painel (`/admin/afiliados`) funcionar de verdade.
7. Se o provedor expõe um relatório de conversões, isso é trabalho futuro —
   ver seção "Conversões" no `affiliate-system-plan.md`.

## Por que nenhum provedor automático foi implementado nesta entrega

Não há credenciais reais de nenhuma rede de afiliados disponíveis. Construir
contra uma API sem poder testar contra o serviço real produziria código
não confiável e potencialmente incompatível com a integração de verdade.
O modo manual (e a importação CSV com associação automática de *produto*,
não de *provedor*) cobre o uso real hoje sem esse risco.
