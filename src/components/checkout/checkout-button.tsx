"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startCheckout } from "@/modules/orders/actions";

export function CheckoutButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    const result = await startCheckout(listingId);

    if ("error" in result) {
      setLoading(false);
      toast.error(result.error);
      return;
    }

    if ("url" in result) {
      window.location.href = result.url;
      return;
    }

    toast.success(
      "Stripe não configurado — pagamento simulado como aprovado para teste."
    );
    router.push(`/checkout/success?orderId=${result.orderId}`);
  }

  return (
    <Button size="lg" className="w-full" onClick={onClick} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
      Pagar com segurança
    </Button>
  );
}
