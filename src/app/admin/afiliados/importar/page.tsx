import type { Metadata } from "next";
import { ImportClient } from "@/components/admin/affiliate/import-client";

export const metadata: Metadata = { title: "Importar ofertas · Afiliados · Admin" };

export default function ImportOffersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold">Importar ofertas via CSV</h1>
        <p className="text-muted-foreground">
          Cadastre várias ofertas manuais de uma vez. Nada é salvo até você
          conferir a prévia e confirmar.
        </p>
      </div>
      <ImportClient />
    </div>
  );
}
