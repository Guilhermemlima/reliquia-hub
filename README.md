# Relíquia Hub

Marketplace de colecionadores — videogames antigos, cards, action figures,
quadrinhos, moedas, vinis e outros itens de coleção. Comprar e vender com
segurança, reputação e curadoria de colecionadores.

Este repositório contém a **Fase 1 (MVP funcional)**: um núcleo completo e
funcional (auth, anúncios, busca, chat, pagamento, pedidos, avaliações,
admin), com arquitetura pronta para as funcionalidades da Fase 2 (leilões,
escrow real, KYC, IA de preço/fraude, fórum, assinaturas, frete, Mercado
Pago). Veja [`ROADMAP.md`](./ROADMAP.md) para o detalhamento.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI) ·
Framer Motion · PostgreSQL + Prisma ORM · Redis (cache opcional) · Cloudinary
(upload de imagem, opcional) · Stripe (pagamento, opcional) · NextAuth v5
(Google / Discord / Credenciais).

## Pré-requisitos

- Node.js 20+
- Docker (recomendado, para subir Postgres + Redis localmente) — **ou** uma
  instância própria de PostgreSQL

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo de ambiente (já existe um `.env` com valores padrão para
   desenvolvimento local; ajuste conforme necessário):

   ```bash
   cp .env.example .env
   ```

3. Suba o Postgres e o Redis locais via Docker:

   ```bash
   docker compose up -d
   ```

   Não tem Docker? Aponte `DATABASE_URL` no `.env` para qualquer instância
   PostgreSQL acessível. O Redis é **opcional** — sem ele, o app funciona
   normalmente, só sem cache.

4. Rode as migrações e popule o banco com categorias e dados de demonstração:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse [http://localhost:3000](http://localhost:3000).

### Contas de teste (criadas pelo seed)

Todas usam a senha `colecionador123`.

| Papel      | E-mail                            |
| ---------- | ---------------------------------- |
| Admin      | admin@reliquiahub.com              |
| Vendedor   | retrogames@reliquiahub.com         |
| Vendedor   | cardvault@reliquiahub.com          |
| Vendedor   | bau@reliquiahub.com                |
| Comprador  | comprador@reliquiahub.com          |

## Integrações opcionais

O app foi desenhado para **nunca quebrar** por falta de credenciais — cada
integração externa fica graciosamente desabilitada até você configurar as
chaves no `.env`:

| Serviço              | Sem configurar                                          | Como habilitar                                   |
| --------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| Login Google/Discord  | Só aparece login por e-mail/senha                        | Preencha `AUTH_GOOGLE_*` / `AUTH_DISCORD_*`        |
| Upload de imagem       | Formulário de anúncio aceita colar uma URL de imagem      | Preencha as variáveis `CLOUDINARY_*`               |
| Pagamento (Stripe)     | Checkout simula um pagamento aprovado automaticamente (modo dev) | Preencha `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Cache (Redis)          | App funciona normalmente sem cache                        | Preencha `REDIS_URL` (já vem configurado se usar o `docker-compose.yml`) |

### Webhook do Stripe em desenvolvimento local

Sem uma URL pública, o Stripe não consegue chamar `/api/webhooks/stripe`
diretamente. Use a [Stripe CLI](https://stripe.com/docs/stripe-cli) para
encaminhar os eventos para o seu `localhost`:

```bash
stripe listen --api-key sk_test_SEU_SECRET_KEY --forward-to localhost:3000/api/webhooks/stripe
```

O comando imprime um `whsec_...` — cole em `STRIPE_WEBHOOK_SECRET` no `.env`
e reinicie `npm run dev`. Enquanto esse comando estiver rodando em segundo
plano, qualquer pagamento aprovado no Checkout atualiza o pedido para
"Pago" automaticamente. Sem ele, o pedido fica preso em "Aguardando
pagamento" mesmo que o pagamento tenha sido aprovado na Stripe (o dinheiro
foi cobrado, só falta o aviso chegar no seu banco local).

Em produção, não precisa da CLI — basta cadastrar o endpoint no Dashboard
da Stripe (**Developers → Webhooks**) apontando para a URL pública.

## Scripts

```bash
npm run dev        # ambiente de desenvolvimento
npm run build       # build de produção
npm run start        # roda o build de produção
npm run lint          # eslint
npm run db:migrate     # prisma migrate dev
npm run db:seed         # popula categorias e dados de demonstração
npm run db:studio        # abre o Prisma Studio
```

## Estrutura do projeto

```
prisma/schema.prisma       # modelo de dados completo
src/app/                   # rotas (App Router)
  (marketing)/              # home, busca, anúncio, perfil de vendedor, vender, checkout
  (auth)/                    # login, cadastro
  dashboard/                  # painel do usuário (anúncios, pedidos, favoritos, mensagens)
  admin/                        # painel administrativo (moderação, denúncias, usuários)
  api/                            # rotas de API (NextAuth, chat, webhook Stripe)
src/modules/                # lógica de domínio por área (listings, users, orders, chat, search, admin, reviews, reports, payments)
src/components/             # componentes de UI reutilizáveis
src/lib/                    # clients (Prisma, Redis, Stripe, Cloudinary, Auth)
```

## Produção

- Configure todas as variáveis de ambiente do `.env.example` no seu provedor
  de hospedagem (Vercel, etc).
- Use um Postgres e Redis gerenciados (Neon/Supabase/RDS, Upstash, etc).
- Configure o webhook do Stripe apontando para `/api/webhooks/stripe`.
- Rode `npm run build` — o build falha se houver erro de tipos.
