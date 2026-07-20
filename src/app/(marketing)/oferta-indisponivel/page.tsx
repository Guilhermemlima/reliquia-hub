import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Oferta indisponível" };

export default function OfferUnavailablePage() {
  return (
    <div className="container mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <AlertTriangle className="mb-4 size-14 text-destructive" />
      <h1 className="font-heading text-2xl font-semibold">
        Esta oferta não está mais disponível
      </h1>
      <p className="mt-2 text-muted-foreground">
        O link pode ter expirado, sido desativado ou a loja pode ter
        encerrado a promoção. Volte ao montador para ver outras opções.
      </p>
      <Button className="mt-6" render={<Link href="/montador" />}>
        Voltar ao montador
      </Button>
    </div>
  );
}
