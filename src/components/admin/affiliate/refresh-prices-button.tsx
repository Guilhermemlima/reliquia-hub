"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { refreshAllOfferPricesAction } from "@/modules/affiliate/actions";

export function RefreshPricesButton() {
  const [isPending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      const result = await refreshAllOfferPricesAction();
      if (result.error || !result.summary) {
        toast.error(result.error ?? "Não foi possível atualizar os preços.");
        return;
      }
      const { checked, updated, notFound, suspicious, errors } = result.summary;
      toast.success(
        `Verificadas ${checked} ofertas: ${updated} atualizadas, ${notFound} sem preço encontrado` +
          `${suspicious ? `, ${suspicious} com valor suspeito (não atualizadas)` : ""}` +
          `${errors ? `, ${errors} com erro` : ""}.`
      );
    });
  }

  return (
    <Button variant="outline" disabled={isPending} onClick={run}>
      <RefreshCw className={isPending ? "animate-spin" : ""} />
      {isPending ? "Atualizando..." : "Atualizar preços"}
    </Button>
  );
}
