import { stripe, stripeEnabled } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** % retido pela plataforma em cada venda paga via Stripe Connect. */
export const PLATFORM_COMMISSION_PERCENT = Number(
  process.env.PLATFORM_COMMISSION_PERCENT ?? "8"
);

export type ConnectLinkResult = { url: string } | { error: string };

/**
 * Garante que o vendedor tenha uma conta Stripe Connect (Express) e devolve
 * um link de onboarding hospedado pelo próprio Stripe. Se a conta já existe
 * mas o cadastro não foi concluído, gera um novo link pra continuar de onde
 * parou — o Stripe cuida de tudo (dados bancários, documentos, etc), nunca
 * passamos esses dados por aqui.
 */
export async function createConnectOnboardingLink(params: {
  userId: string;
  email: string | null | undefined;
}): Promise<ConnectLinkResult> {
  if (!stripe || !stripeEnabled) return { error: "Stripe não está configurado." };

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: params.userId },
  });
  if (!profile) return { error: "Você precisa ter um perfil de vendedor." };

  let accountId = profile.stripeAccountId;

  if (!accountId) {
    try {
      const account = await stripe.accounts.create({
        type: "express",
        country: "BR",
        email: params.email ?? undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
      });
      accountId = account.id;
      await prisma.sellerProfile.update({
        where: { userId: params.userId },
        data: { stripeAccountId: accountId },
      });
    } catch (err) {
      console.error("[stripe-connect] falha ao criar conta", err);
      return { error: "Não foi possível criar a conta de recebimento no Stripe." };
    }
  }

  try {
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${APP_URL}/dashboard/pagamentos?refresh=1`,
      return_url: `${APP_URL}/dashboard/pagamentos?connected=1`,
      type: "account_onboarding",
    });
    return { url: link.url };
  } catch (err) {
    console.error("[stripe-connect] falha ao gerar link de onboarding", err);
    return { error: "Não foi possível gerar o link de conexão com o Stripe." };
  }
}

/** Consulta o status atual da conta direto no Stripe e sincroniza no banco. */
export async function syncConnectAccountStatus(userId: string) {
  if (!stripe) return null;

  const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (!profile?.stripeAccountId) return null;

  const account = await stripe.accounts.retrieve(profile.stripeAccountId);
  await prisma.sellerProfile.update({
    where: { userId },
    data: {
      stripeChargesEnabled: Boolean(account.charges_enabled),
      stripeDetailsSubmitted: Boolean(account.details_submitted),
    },
  });

  return {
    chargesEnabled: Boolean(account.charges_enabled),
    detailsSubmitted: Boolean(account.details_submitted),
  };
}
