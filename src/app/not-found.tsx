import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Compass className="size-14 text-primary" />
      <h1 className="font-heading text-3xl font-semibold">Página não encontrada</h1>
      <p className="max-w-sm text-muted-foreground">
        O item ou a página que você procura não existe ou foi removido.
      </p>
      <Button render={<Link href="/" />}>Voltar ao início</Button>
    </div>
  );
}
