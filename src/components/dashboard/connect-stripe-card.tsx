"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, CircleDashed, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { connectStripeAccount, refreshStripeAccountStatus } from "@/modules/sellers/actions";

export function ConnectStripeCard({
  hasAccount,
  chargesEnabled: initialChargesEnabled,
  detailsSubmitted: initialDetailsSubmitted,
}: {
  hasAccount: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [chargesEnabled, setChargesEnabled] = useState(initialChargesEnabled);
  const [detailsSubmitted, setDetailsSubmitted] = useState(initialDetailsSubmitted);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("connected") || searchParams.get("refresh")) {
      startTransition(async () => {
        const result = await refreshStripeAccountStatus();
        if ("chargesEnabled" in result) {
          setChargesEnabled(result.chargesEnabled);
          setDetailsSubmitted(result.detailsSubmitted);
          if (result.chargesEnabled) {
            toast.success("Conta Stripe conectada e liberada pra receber pagamentos!");
          } else {
            toast.info("Cadastro salvo — ainda falta o Stripe confirmar alguma informação.");
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function connect() {
    startTransition(async () => {
      const result = await connectStripeAccount();
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      window.location.href = result.url;
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center gap-2">
          {chargesEnabled ? (
            <Badge className="bg-success text-success-foreground">
              <CheckCircle2 className="size-3.5" /> Recebendo pagamentos
            </Badge>
          ) : hasAccount ? (
            <Badge variant="secondary">
              <CircleDashed className="size-3.5" /> Cadastro incompleto
            </Badge>
          ) : (
            <Badge variant="outline">Não conectado</Badge>
          )}
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          {chargesEnabled
            ? "Sua conta está pronta — o valor das vendas (menos a comissão da plataforma) vai direto pra ela a cada pagamento aprovado."
            : hasAccount && detailsSubmitted
              ? "O Stripe recebeu seus dados e está analisando. Isso costuma ser rápido, mas pode levar um tempo."
              : "Você será redirecionado pro Stripe pra informar seus dados (documento, conta bancária). Nada disso passa pelo Relíquia Hub — o Stripe cuida de tudo com segurança."}
        </p>

        <Button onClick={connect} disabled={isPending}>
          {hasAccount ? "Continuar cadastro no Stripe" : "Conectar com Stripe"} <ExternalLink />
        </Button>
      </CardContent>
    </Card>
  );
}
