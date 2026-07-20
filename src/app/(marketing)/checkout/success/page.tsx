import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Compra confirmada" };

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <CheckCircle2 className="mb-4 size-14 text-success" />
      <h1 className="font-heading text-2xl font-semibold">
        Pedido confirmado!
      </h1>
      <p className="mt-2 text-muted-foreground">
        Avisamos o vendedor para preparar o envio. Você pode acompanhar o
        status do seu pedido a qualquer momento no seu painel.
      </p>
      <Button className="mt-6" render={<Link href="/dashboard/orders" />}>
        Ver meus pedidos
      </Button>
    </div>
  );
}
