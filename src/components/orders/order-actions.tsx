"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markShipped, confirmReceipt } from "@/modules/orders/actions";

export function SellerOrderActions({ orderId, status }: { orderId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  if (status !== "PAID") return null;

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await markShipped(orderId);
          if (result.error) toast.error(result.error);
          else toast.success("Pedido marcado como enviado.");
        })
      }
    >
      Marcar como enviado
    </Button>
  );
}

export function BuyerOrderActions({ orderId, status }: { orderId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  if (status !== "PAID" && status !== "SHIPPED") return null;

  return (
    <Button
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await confirmReceipt(orderId);
          if (result.error) toast.error(result.error);
          else toast.success("Recebimento confirmado! Obrigado.");
        })
      }
    >
      Confirmar recebimento
    </Button>
  );
}
