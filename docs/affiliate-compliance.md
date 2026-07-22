# Compliance e transparência — sistema de afiliados

## Onde o usuário é avisado

- Diálogo "Ver lojas e comprar" do montador (`components/builder/strategy-card.tsx`)
  mostra, abaixo da lista de lojas, o aviso:
  > "Alguns desses links são links de afiliados. O Relíquia Hub pode
  > receber uma comissão quando uma compra é realizada por meio deles,
  > sem custo adicional para você."
- Página dedicada `/politica-de-afiliados`, linkada no rodapé do site
  (coluna "Montador de PC") e referenciada no aviso acima.

## O que a política cobre

`src/app/(marketing)/politica-de-afiliados/page.tsx` documenta, em
linguagem simples:

1. Que links no montador e nas páginas de jogos podem ser de afiliados.
2. O que o Relíquia Hub faz (compara ofertas, exibe preço/condições/data de
   atualização, registra o clique).
3. O que é responsabilidade **da loja parceira**: pagamento, parcelamento,
   frete, estoque, nota fiscal, garantia, devolução e atendimento — o
   Relíquia Hub não participa da transação em si.
4. Que preços e estoque podem mudar a qualquer momento na loja, e que a
   compra é concluída inteiramente lá.
5. Como funciona o rastreamento de clique (sessão anônima, sem dado
   pessoal) — ver detalhamento em `affiliate-security.md`.

## Regras de conduta seguidas no código

- **Nenhum redirecionamento invisível ou automático**: comprar sempre
  exige um clique explícito do usuário num link visível
  (`href` real, `target="_blank"`), nunca `window.open` disparado sem
  interação.
- **"Comprar todas as peças" não abre várias abas sozinho**: cada
  estratégia do montador abre um diálogo de revisão (`StrategyCard`)
  listando loja e preço de cada peça — o usuário clica item por item.
- **Nenhum parâmetro de afiliado inventado**: o modo manual nunca
  modifica a URL informada pelo admin além de validar o domínio; nenhuma
  string de tracking é adicionada por conta própria.
- **Prévia de link ≠ scraping**: `modules/affiliate/link-preview.ts` só lê
  as tags `og:title`/`og:image` que a própria página expõe publicamente
  para gerar preview (a mesma técnica de WhatsApp/Slack) — usado na
  importação CSV pra sugerir nome/imagem de peça nova.
- **Atualização de preço é melhor esforço, não scraping estruturado**:
  `modules/affiliate/price-fetch.ts` (usado pelo botão "Atualizar preços")
  só lê dados de preço que a própria página expõe publicamente em formato
  estruturado (JSON-LD schema.org/Product, meta tags de preço) — não
  simula login, não navega por várias páginas, não contorna paywall/captcha
  e falha silenciosamente quando a loja bloqueia. Lojas sem API oficial
  (Amazon incluída, até termos acesso à PA-API) vão falhar com frequência —
  isso é esperado. Um valor capturado muito fora do preço anterior é
  descartado automaticamente (ver `price-refresh.ts`) em vez de sobrescrever
  a oferta com um número possivelmente errado.
- **Nenhum link de domínio não autorizado**: reforçado tanto no cadastro
  quanto no redirecionamento (`affiliate-security.md`).
- **Comissão nunca é o único critério de ordenação**: as três estratégias
  do montador (mais barato / menos lojas / melhor equilíbrio) são todas
  baseadas em preço e número de lojas — nenhuma delas prioriza por valor
  de comissão (que, aliás, ainda não é rastreado nesta fase — ver
  `AffiliateConversion` como trabalho futuro no plano).

## O que ainda falta para compliance completo

- Consentimento de cookies explícito (o cookie `rh_aff_sid` é técnico/
  necessário para o rastreamento funcionar, mas uma revisão jurídica local
  pode exigir um banner de consentimento dependendo da jurisdição).
- Página de Termos de Uso e Política de Privacidade gerais do site (hoje só
  existe a política específica de afiliados).
- Se um provedor automático for implementado, revisar os termos específicos
  daquele programa de afiliados (cada rede tem regras próprias sobre como o
  link pode ser exibido, cookie stuffing, etc.) antes de ativar em produção.
