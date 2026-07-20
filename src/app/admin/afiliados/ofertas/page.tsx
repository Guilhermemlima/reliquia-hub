import Link from "next/link";
import type { Metadata } from "next";
import { Upload } from "lucide-react";
import { getAllOffers } from "@/modules/affiliate/queries";
import { getActiveStores } from "@/modules/affiliate/queries";
import { getAllParts, PART_CATEGORY_LABELS } from "@/modules/parts/queries";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { OfferFormDialog } from "@/components/admin/affiliate/offer-form-dialog";
import { OfferRow } from "@/components/admin/affiliate/offer-row";

export const metadata: Metadata = { title: "Ofertas · Afiliados · Admin" };

export default async function AdminOffersPage() {
  const [offers, stores, parts] = await Promise.all([
    getAllOffers(),
    getActiveStores(),
    getAllParts(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Ofertas de afiliados</h1>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/admin/afiliados/importar" />}>
            <Upload /> Importar CSV
          </Button>
          <OfferFormDialog
            parts={parts.map((p) => ({ id: p.id, name: p.name, category: p.category }))}
            stores={stores.map((s) => ({ id: s.id, name: s.name }))}
          />
        </div>
      </div>

      {parts.length === 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          Ainda não há peças cadastradas no catálogo — rode o seed para
          popular CPUs, GPUs e outras categorias antes de criar ofertas.
        </p>
      )}

      {offers.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma oferta cadastrada ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Peça</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead>Cliques</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <OfferRow
                  key={offer.id}
                  offer={{
                    id: offer.id,
                    partName: `${PART_CATEGORY_LABELS[offer.part.category] ?? offer.part.category} — ${offer.part.name}`,
                    storeName: offer.store.name,
                    price: offer.normalPrice.toString(),
                    status: offer.status,
                    updatedAt: offer.updatedAt.toISOString(),
                    clicks: offer._count.clicks,
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
