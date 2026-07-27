import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSellerProfileByUserId } from "@/modules/sellers/queries";
import { PLATFORM_COMMISSION_PERCENT } from "@/modules/payments/connect";
import { ConnectStripeCard } from "@/components/dashboard/connect-stripe-card";

export const metadata: Metadata = { title: "Pagamentos · Painel" };

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await getSellerProfileByUserId(session.user.id);

  return (
    <div className="max-w-xl">
      <h1 className="mb-2 font-heading text-2xl font-semibold">Pagamentos</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Conecte sua conta Stripe pra receber o valor das suas vendas
        diretamente — a plataforma retém {PLATFORM_COMMISSION_PERCENT}% de
        comissão automaticamente em cada venda, o restante cai na sua conta.
      </p>

      {!profile ? (
        <p className="text-sm text-muted-foreground">
          Você ainda não tem um perfil de vendedor — crie seu primeiro anúncio
          em <a href="/sell/new" className="underline">Anunciar item</a> antes
          de conectar o recebimento.
        </p>
      ) : (
        <ConnectStripeCard
          chargesEnabled={profile.stripeChargesEnabled}
          detailsSubmitted={profile.stripeDetailsSubmitted}
          hasAccount={Boolean(profile.stripeAccountId)}
        />
      )}
    </div>
  );
}
