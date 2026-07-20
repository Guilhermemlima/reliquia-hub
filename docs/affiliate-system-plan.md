# Plano — Sistema de Afiliados + Montador de PC + Páginas de Jogos

## 1. Diagnóstico do sistema atual

- **Framework**: Next.js 15 (App Router), TypeScript, React 19.
- **UI**: Tailwind v4 + shadcn/ui (Base UI), Framer Motion.
- **Banco**: PostgreSQL (Neon) via Prisma ORM 6.
- **Auth**: NextAuth v5 (Google/Discord/Credenciais), `role` em `User` (`USER`/`SELLER`/`ADMIN`), gate de rotas via `src/middleware.ts` + checagem redundante em `src/app/admin/layout.tsx`.
- **Domínio atual**: marketplace **P2P** de colecionáveis. `Listing` é um anúncio de um vendedor específico para um item **único** (ex: "meu Charizard usado") — não é um catálogo canônico comparável entre lojas. Por isso o sistema de afiliados **não** vai pendurar ofertas externas em cima de `Listing`.
- **Padrões de código já estabelecidos** (reaproveitados neste módulo):
  - `src/modules/<área>/{schema,queries,actions}.ts` — zod para validação, queries Prisma, server actions `"use server"`.
  - `src/lib/prisma.ts`, `src/lib/redis.ts` (cache opcional, nunca obrigatório).
  - Layout admin em `src/app/admin/layout.tsx` (checa `session.user.role === "ADMIN"`, senão `redirect("/")`).
  - Tabelas shadcn (`Table`, `TableRow`...) + dialogs para formulários administrativos (ver `components/admin/*`).
  - Rotas de API tipo `route.ts` para webhooks/redirecionamentos (ver `api/webhooks/stripe`).

- **O que já existe e será reaproveitado**:
  - Autenticação e RBAC (`role: ADMIN`) — usado para proteger `/admin/afiliados` e `/montador/admin`.
  - Layout/estilo administrativo (`src/app/admin/layout.tsx`, `DashboardNav`-like sidebar).
  - Padrão de módulos (`src/modules/*`).
  - `formatPrice`/`formatDate` em `src/lib/format.ts`.
  - Sistema de categorias dinâmicas (`Category.attributesSchema`) **não** será reaproveitado para peças de PC — peças precisam de campos fixos de compatibilidade (socket, tipo de memória etc.), então ganham modelo próprio (`Part`), mais simples de validar.

- **O que NÃO existia e precisou ser criado do zero**: catálogo canônico de produtos comparáveis (peças de PC), qualquer noção de "loja parceira"/"oferta externa"/"clique de afiliado", jogos, filas de job, importação de feed.

## 2. Escopo desta entrega (acordado com o usuário)

O prompt original tem 34 seções (arquitetura completa de afiliados multi-provedor, filas, importação em lote, relatórios de conversão, alertas de preço). Ficou definido que esta entrega cobre:

- **Etapa 1 — Estrutura central**: tabelas, serviços, permissões, painel admin básico.
- **Etapa 2 — Provedor manual universal**: cadastro de oferta manual, validação de domínio, rota `/go/[offerId]` seguro, registro de clique.
- **Arquitetura de provedores (parte da Etapa 3)**: interface `AffiliateProvider` comum + `ManualAffiliateProvider` implementando-a, para provedores automáticos (Amazon, Awin etc.) serem plugados depois **sem** reescrever o núcleo. Nenhum provedor automático foi implementado — não há credenciais reais e o prompt proíbe inventar tokens/endpoints.
- **Montador de PC + páginas de jogos**: construídos do zero (o usuário confirmou que quer essa vertical), usando o catálogo `Part` como "produto interno" do sistema de afiliados — é o encaixe natural, já que peças de PC são produtos comparáveis entre lojas (diferente de um `Listing` de colecionador).

- **Etapa 5 — Importação CSV e geração em lote**: entregue numa segunda rodada. Admin sobe um CSV (`part_slug,store_slug,seller_name,price,pix_price,shipping_price,condition,availability,original_url,affiliate_url`), vê prévia, confirma, e recebe um resumo (processadas/criadas/já existentes/erros) linha a linha — reaproveita a mesma validação de domínio e detecção de duplicidade do cadastro manual único.

**Fora do escopo desta entrega** (documentado como próximos passos): `ExternalProduct`/`ProductMapping` (só fazem sentido quando existir busca/matching automático), fila de jobs assíncrona (a importação CSV roda síncrona, limitada a 500 linhas por vez), importação de feed XML/JSON, relatórios de conversão importados, alertas de preço, testes automatizados (o projeto ainda não tem framework de testes configurado).

## 3. Novas tabelas (Prisma, aditivas — nenhuma tabela existente foi alterada)

| Tabela | Papel |
| --- | --- |
| `Store` | Loja parceira (nome, slug, domínios permitidos, status). |
| `AffiliateProgram` | Programa de afiliados de uma loja (tipo de integração, status, config genérica — `providerType` default `MANUAL`). |
| `Part` | Catálogo canônico de peças de PC (categoria, marca, modelo, specs). |
| `Offer` | Oferta externa de uma loja para uma `Part` (preço, pix, parcelamento, frete, URL original, URL de afiliado, status). |
| `OfferPriceHistory` | Histórico de preço de cada oferta (nunca é apagado ao atualizar). |
| `AffiliateClick` | Registro de clique no redirecionamento `/go/[offerId]` (sem dados pessoais — só sessão anônima). |
| `Game` | Jogo (nome, slug, descrição, capa). |
| `GameRecommendedPart` | Peça recomendada para um jogo numa combinação resolução+FPS alvo. |

Todos os enums (`AffiliateProviderType`, `OfferStatus`, `OfferAvailability`, `OfferCondition`, `ClickSourceType`, `PartCategory`) seguem o vocabulário sugerido no prompt, adaptado ao Prisma.

## 4. Novos serviços (`src/modules/`)

- `modules/affiliate/schema.ts` — zod (loja, programa, oferta manual).
- `modules/affiliate/provider.ts` — interface `AffiliateProvider` + `ManualAffiliateProvider` + registro de provedores.
- `modules/affiliate/domain-validation.ts` — valida HTTPS + domínio permitido antes de salvar qualquer URL.
- `modules/affiliate/link-service.ts` — `AffiliateLinkService.generateLink()`, hoje só chama o provedor manual.
- `modules/affiliate/queries.ts` / `actions.ts` — CRUD de lojas/programas/ofertas (admin-only) e leitura pública de ofertas por peça.
- `modules/affiliate/click.ts` — grava `AffiliateClick` a partir da rota `/go`.
- `modules/builder/queries.ts` — monta as 3 estratégias (mais barato / menos lojas / melhor equilíbrio).
- `modules/games/queries.ts` — jogos e peças recomendadas.
- `modules/affiliate/csv.ts` — parser de CSV + template de exemplo (sem dependência externa).
- `modules/affiliate/import-service.ts` — núcleo da importação em lote (validação, dedup, criação), separado do server action pra poder ser testado sem sessão HTTP.
- `modules/affiliate/import-actions.ts` — server action `importOffersCsv` (checa admin, delega ao import-service).

## 5. Novas rotas

- `GET /go/[offerId]` — redirecionamento seguro (nunca aceita URL arbitrária).
- `/admin/afiliados` — visão geral (lojas, programas, ofertas, cliques).
- `/admin/afiliados/ofertas` — CRUD de ofertas manuais.
- `/admin/afiliados/importar` — importação em lote via CSV (prévia + resumo).
- `/montador` — montador de PC (3 estratégias de preço).
- `/jogos`, `/jogos/[slug]` — páginas de jogos com build recomendada.
- `/politica-de-afiliados` — transparência comercial.

## 6. Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Open redirect via `/go` | Só aceita `offerId` de oferta já cadastrada no banco; nunca lê URL da query string. Domínio final revalidado contra `Store.allowedDomains` no momento do redirecionamento, não só na criação. |
| Vazamento de credencial de afiliado | Nesta entrega não há credenciais reais (só modo manual). Campo `encryptedCredentials` já reservado no schema para quando houver provedor automático — nunca será exposto ao client. |
| Oferta com preço desatualizado exibida como atual | `Offer.lastCheckedAt` exibido na UI; classificação "recente/atenção/desatualizada" configurável. |
| Link afiliado escondido do usuário | Aviso fixo de transparência perto de todo botão "Comprar na loja". |
| Confusão entre `Listing` (P2P) e `Offer` (afiliado) | Nomenclatura e rotas totalmente separadas; nenhuma tabela existente foi tocada. |

## 7. Estratégia de segurança

- Credenciais de programas de afiliados nunca são obrigatórias nesta fase (modo manual não usa nenhuma).
- Toda mutação (`createStore`, `createOffer` etc.) exige `session.user.role === "ADMIN"`, verificado no server action — mesmo padrão de `modules/admin/actions.ts`.
- URLs de oferta (original e de afiliado) validadas contra `Store.allowedDomains` + HTTPS obrigatório antes de persistir.
- `/go/[offerId]` revalida a oferta e o domínio a cada acesso (defesa em profundidade, não confia só na validação de cadastro).
- Nenhum dado pessoal é gravado em `AffiliateClick` — só um id de sessão anônimo (cookie técnico, sem PII) e metadados de contexto (página de origem, tipo de dispositivo).

## 8. Estratégia de testes

O projeto ainda não tem framework de testes configurado (sem `jest`/`vitest`). Configurar um framework do zero está fora do escopo combinado desta entrega. Em vez disso:

- Verificação manual ponta a ponta no navegador (cadastro de loja → programa → oferta → clique em `/go` → contagem de clique) — documentada na seção de validação manual do relatório final.
- `tsc --noEmit` e `eslint` limpos antes de considerar qualquer etapa concluída (mesmo padrão usado no resto da sessão).
- Recomendação registrada em `ROADMAP.md`: adicionar Vitest + testes dos itens da seção 30 do prompt original (open redirect, domínio bloqueado, fallback manual etc.) como próximo passo.

## 9. Ordem de implementação desta entrega

1. Schema Prisma (aditivo) + migração.
2. Núcleo do módulo de afiliados (interface de provedor, provedor manual, validação de domínio, serviços).
3. Rota `/go/[offerId]` + registro de clique.
4. Painel `/admin/afiliados` (lojas, programas, ofertas manuais, cliques).
5. Catálogo `Part` + seed de peças de PC.
6. `/montador` com as 3 estratégias.
7. `/jogos` + `/jogos/[slug]`.
8. Avisos de transparência + `/politica-de-afiliados`.
9. Verificação ponta a ponta no navegador + relatório final.
