import type { Metadata } from "next";
import { AlertTriangle, Smartphone, MousePointerClick, PackageX } from "lucide-react";
import { getClickReport, getOfferHealthReport, STALE_OFFER_DAYS } from "@/modules/affiliate/reports";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Relatórios · Afiliados · Admin" };

const SOURCE_LABELS: Record<string, string> = {
  PRODUCT_PAGE: "Página de produto",
  BUILDER: "Montador de PC",
  GAME_PAGE: "Página de jogo",
  OTHER: "Outro",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativas",
  INACTIVE: "Inativas",
  EXPIRED: "Expiradas",
  PENDING_REVIEW: "Aguardando revisão",
};

export default async function AffiliateReportsPage() {
  const [clicks, offerHealth] = await Promise.all([
    getClickReport(),
    getOfferHealthReport(),
  ]);

  const maxDay = Math.max(1, ...clicks.last14Days.map((d) => d.count));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Relatórios de afiliados</h1>
        <p className="text-muted-foreground">
          Cliques, saúde das ofertas e cobertura do catálogo.
        </p>
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold">
          <MousePointerClick className="size-5 text-primary" /> Cliques (14 dias)
        </h2>
        <Card>
          <CardContent className="pt-6">
            {clicks.last14Days.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem cliques no período.</p>
            ) : (
              <div className="flex h-32 items-end gap-1.5">
                {clicks.last14Days.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-primary"
                      style={{ height: `${Math.max(4, (d.count / maxDay) * 100)}%` }}
                      title={`${d.day}: ${d.count} cliques`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {d.day.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-3 flex items-center gap-2 font-medium">
              <Smartphone className="size-4" /> Cliques por dispositivo
            </h3>
            {clicks.byDevice.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {clicks.byDevice.map((d) => (
                  <li key={d.device} className="flex justify-between">
                    <span className="capitalize text-muted-foreground">{d.device}</span>
                    <span className="font-medium">{d.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-3 font-medium">Cliques por origem</h3>
            {clicks.bySourceType.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {clicks.bySourceType.map((s) => (
                  <li key={s.source} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {SOURCE_LABELS[s.source] ?? s.source}
                    </span>
                    <span className="font-medium">{s.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">Ofertas mais clicadas</h2>
        <Card>
          <CardContent className="pt-6">
            {clicks.topOffers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem cliques ainda.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {clicks.topOffers.map((o) => (
                  <li key={o.offerId} className="flex items-center justify-between">
                    <span>
                      {o.partName} <span className="text-muted-foreground">— {o.storeName}</span>
                    </span>
                    <Badge variant="secondary">{o.clicks} cliques</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">Status das ofertas</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {offerHealth.statusCounts.map((s) => (
            <Card key={s.status}>
              <CardContent className="pt-6 text-center">
                <p className="text-xl font-semibold">{s.count}</p>
                <p className="text-xs text-muted-foreground">
                  {STATUS_LABELS[s.status] ?? s.status}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold">
          <AlertTriangle className="size-5 text-destructive" /> Ofertas desatualizadas
          (+{STALE_OFFER_DAYS} dias sem checar)
        </h2>
        <Card>
          <CardContent className="pt-6">
            {offerHealth.staleOffers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma oferta desatualizada — tudo em dia.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {offerHealth.staleOffers.map((o) => (
                  <li key={o.id} className="flex items-center justify-between">
                    <span>
                      {o.partName} <span className="text-muted-foreground">— {o.storeName}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      verificado em {formatDate(o.lastCheckedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold">
          <PackageX className="size-5 text-muted-foreground" /> Peças sem oferta ativa
        </h2>
        <Card>
          <CardContent className="pt-6">
            {offerHealth.partsWithoutOffer.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todas as peças do catálogo têm pelo menos uma oferta ativa.
              </p>
            ) : (
              <ul className="space-y-1 text-sm text-muted-foreground">
                {offerHealth.partsWithoutOffer.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
