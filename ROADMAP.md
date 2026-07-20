# Roadmap

## Fase 1 — MVP funcional (este repositório)

- [x] Auth (Google, Discord, e-mail/senha)
- [x] Perfil público de vendedor + reputação
- [x] Anúncios com categorias e atributos dinâmicos
- [x] Upload de múltiplas imagens (Cloudinary)
- [x] Busca avançada com filtros por categoria, preço, condição
- [x] Favoritos / wishlist
- [x] Chat comprador-vendedor (polling)
- [x] Checkout (Stripe) + histórico de pedidos
- [x] Avaliações de compradores/vendedores
- [x] Denúncias de anúncios
- [x] Painel administrativo (moderação, denúncias, usuários)
- [x] Painel do vendedor (anúncios, vendas)
- [x] Histórico de preço por anúncio

## Fase 2 — planejado (não implementado ainda)

Os campos/enums abaixo já existem no schema do Prisma (`saleType`,
`kycStatus`, `escrowReleasedAt`) para essas features não exigirem migração
destrutiva quando forem implementadas:

- [ ] **Leilões** — `Listing.saleType = AUCTION`, contagem regressiva, lances
- [ ] **Sistema de ofertas** (negociação de preço)
- [ ] **Escrow real** — hoje o pagamento é liberado ao vendedor
      imediatamente após confirmação de recebimento pelo comprador; falta a
      retenção real do valor por um intermediário/gateway de escrow
- [ ] **KYC de vendedor** (`SellerProfile.kycStatus`)
- [ ] **IA de sugestão de preço e detecção de fraude**
- [ ] **Fórum de colecionadores**
- [ ] **Promoção de anúncios / Assinatura Premium**
- [ ] **Frete integrado** (Correios/transportadoras, cálculo automático)
- [ ] **Mercado Pago** (`modules/payments/provider.ts` já tem a interface
      pronta — implementar `mercadoPagoProvider`)
- [ ] **Notificações em tempo real** via WebSocket/Pusher (hoje é
      polling — trocar a implementação por trás de `/api/chat/[id]`)
- [ ] Extração de módulos para microsserviços, se a escala justificar
