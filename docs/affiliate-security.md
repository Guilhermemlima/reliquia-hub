# Segurança do sistema de afiliados

## Redirecionamento (`/go/[offerId]`) — proteção contra open redirect

`src/app/go/[offerId]/route.ts` **nunca** lê uma URL de destino a partir da
query string. O único parâmetro de identificação é `offerId`, resolvido
contra o banco:

1. Busca a `Offer` pelo `id`. Se não existir → redireciona para
   `/oferta-indisponivel`.
2. Confere `offer.status === "ACTIVE"` e `offer.store.status === "ACTIVE"`.
3. Resolve o destino (`affiliateUrl` ou, na ausência, `originalUrl`).
4. Revalida o domínio do destino contra `store.allowedDomains`
   (`isUrlAllowedForStore`) **de novo**, mesmo que isso já tenha sido
   checado no cadastro — defesa em profundidade, caso os domínios
   permitidos da loja mudem depois que a oferta foi criada.
5. Só então redireciona (302) e registra o clique.

Não existe (e não deve existir) uma rota tipo `/go?url=...` aceitando
qualquer URL arbitrária.

## Validação de domínio

`src/modules/affiliate/domain-validation.ts` (`isUrlAllowedForStore`) é
usada em três pontos: cadastro manual de oferta (`actions.ts`), importação
CSV (`import-service.ts`) e o próprio redirecionamento (`/go`). Regras:

- A URL precisa ser `https://`.
- O host precisa ser exatamente um domínio da lista `Store.allowedDomains`,
  ou um subdomínio dele (`www.kabum.com.br` bate com `kabum.com.br`).
- Qualquer outro domínio é rejeitado com uma mensagem de erro específica.

## Credenciais de programas de afiliados

Nesta fase, **nenhuma credencial real existe** — só o provedor manual está
ativo, e ele não usa nenhuma. Ainda assim, o schema já reserva o terreno:

- `AffiliateProgram.encryptedCredentials` (`String?`) — campo reservado
  para quando um provedor automático precisar guardar um token. Hoje está
  sempre `null`. **Nunca** é selecionado nas queries que alimentam
  componentes client nem devolvido em nenhuma resposta de server action.
- `AffiliateProgram.affiliateIdentifier` é o único identificador exposto na
  UI — é um dado público (ex: tracking id), não um segredo.
- Quando um provedor automático for implementado, a chave/token real deve
  vir de variável de ambiente (nunca hardcoded) e, se precisar ser
  persistida por loja, ser cifrada antes de gravar em
  `encryptedCredentials` — nunca em texto plano.

## Controle de acesso

Toda mutação do módulo (`modules/affiliate/actions.ts`,
`import-actions.ts`, `review-actions.ts`) começa com:

```ts
const session = await auth();
if (!session?.user || session.user.role !== "ADMIN") return { error: "Acesso negado." };
```

As páginas `/admin/afiliados/*` herdam a checagem de `src/app/admin/layout.tsx`
(`redirect("/")` se não for admin) e o `src/middleware.ts` já bloqueia
`/admin/*` para quem não está autenticado antes mesmo de a página renderizar.

## Privacidade do rastreamento de cliques

`AffiliateClick` guarda: `offerId`, `storeId`, `affiliateProgramId`,
`anonymousSessionId` (UUID gerado no primeiro clique, armazenado num cookie
`httpOnly` chamado `rh_aff_sid`), `sourcePage`, `sourceType`, `campaign`,
`deviceType` (derivado do `User-Agent`, não do IP) e `createdAt`.

**Não é gravado**: nome, e-mail, IP, CPF ou qualquer identificador pessoal.
O cookie de sessão anônima não é vinculado à conta do usuário — funciona
mesmo para visitantes deslogados, exatamente para não precisar de dado
pessoal nenhum.

## Importação CSV

- Limite de 500 linhas por importação (`MAX_IMPORT_ROWS` em
  `import-service.ts`) — evita uma requisição HTTP muito longa travando o
  processo do servidor. Arquivos maiores precisam ser divididos.
- Toda URL de toda linha passa pela mesma `isUrlAllowedForStore` do
  cadastro manual — não existe atalho que pule essa validação.
- Linhas com peça associada por baixa confiança nunca viram oferta direto —
  vão para `OfferMatchReview` e exigem aprovação manual de um admin
  (`/admin/afiliados/revisao`).
