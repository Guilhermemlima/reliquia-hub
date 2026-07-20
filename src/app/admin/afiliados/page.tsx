import Link from "next/link";
import type { Metadata } from "next";
import { MousePointerClick, Tags, ArrowRight } from "lucide-react";
import { getStores, getClickStats } from "@/modules/affiliate/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StoreFormDialog } from "@/components/admin/affiliate/store-form-dialog";
import { ProgramFormDialog } from "@/components/admin/affiliate/program-form-dialog";
import { StoreCard } from "@/components/admin/affiliate/store-card";

export const metadata: Metadata = { title: "Afiliados · Admin" };

export default async function AdminAffiliatesPage() {
  const [stores, clickStats] = await Promise.all([getStores(), getClickStats()]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">
          Programas de afiliados
        </h1>
        <div className="flex gap-2">
          <ProgramFormDialog stores={stores.map((s) => ({ id: s.id, name: s.name }))} />
          <StoreFormDialog />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <MousePointerClick className="mb-2 size-5 text-primary" />
            <p className="text-2xl font-semibold">{clickStats.totalClicks}</p>
            <p className="text-sm text-muted-foreground">Cliques totais</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Tags className="mb-2 size-5 text-primary" />
            <p className="text-2xl font-semibold">
              {stores.reduce((sum, s) => sum + s._count.offers, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Ofertas cadastradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col justify-between pt-6">
            <p className="text-sm text-muted-foreground">Gerenciar ofertas</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-fit"
              render={<Link href="/admin/afiliados/ofertas" />}
            >
              Ver ofertas <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      </div>

      {clickStats.byStore.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 font-heading text-lg font-semibold">
            Cliques por loja
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {clickStats.byStore.map((s) => (
              <Card key={s.storeId}>
                <CardContent className="pt-6">
                  <p className="text-xl font-semibold">{s.clicks}</p>
                  <p className="text-sm text-muted-foreground">{s.storeName}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-3 font-heading text-lg font-semibold">Lojas</h2>
      {stores.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhuma loja cadastrada ainda. Crie a primeira loja para começar.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={{
                id: store.id,
                name: store.name,
                status: store.status,
                allowedDomains: store.allowedDomains,
                _count: store._count,
                programs: store.programs.map((p) => ({
                  id: p.id,
                  name: p.name,
                  providerType: p.providerType,
                  status: p.status,
                  lastConnectionTest: p.lastConnectionTest?.toISOString() ?? null,
                })),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
