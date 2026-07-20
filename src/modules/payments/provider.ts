import { stripe, stripeEnabled } from "@/lib/stripe";

export type CheckoutSessionParams = {
  orderId: string;
  amount: number;
  currency: string;
  productName: string;
  productImage?: string;
  buyerEmail?: string | null;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutSessionResult =
  | { url: string; sessionId: string }
  | { error: string };

/**
 * Abstração comum de provedor de pagamento. Hoje só o Stripe está
 * implementado; o Mercado Pago entra na Fase 2 implementando a mesma
 * interface, sem precisar mudar o código que chama `createCheckoutSession`.
 */
export interface PaymentProvider {
  enabled: boolean;
  createCheckoutSession(
    params: CheckoutSessionParams
  ): Promise<CheckoutSessionResult>;
}

export const stripeProvider: PaymentProvider = {
  enabled: stripeEnabled,
  async createCheckoutSession(params) {
    if (!stripe) return { error: "Stripe não está configurado." };

    // A Stripe só aceita URLs http(s) reais como imagem do produto —
    // fotos de exemplo (data URI) ou sem imagem são omitidas.
    const productImage = params.productImage?.startsWith("http")
      ? params.productImage
      : undefined;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: params.buyerEmail ?? undefined,
        line_items: [
          {
            price_data: {
              currency: params.currency.toLowerCase(),
              product_data: {
                name: params.productName,
                images: productImage ? [productImage] : undefined,
              },
              unit_amount: Math.round(params.amount * 100),
            },
            quantity: 1,
          },
        ],
        metadata: { orderId: params.orderId },
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      });

      if (!session.url) return { error: "Não foi possível iniciar o pagamento." };
      return { url: session.url, sessionId: session.id };
    } catch (err) {
      console.error("[stripe] falha ao criar checkout session", err);
      return { error: "Não foi possível iniciar o pagamento com o Stripe." };
    }
  },
};

/** Reservado para a Fase 2 — mesma interface do Stripe. */
export const mercadoPagoProvider: PaymentProvider = {
  enabled: false,
  async createCheckoutSession() {
    return { error: "Mercado Pago ainda não está disponível." };
  },
};

export const paymentProvider = stripeProvider;
