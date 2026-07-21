"use client";

import { useState } from "react";
import { ExternalLink, ImageOff, ShieldCheck, Store as StoreIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";
import { PART_CATEGORY_LABELS } from "@/modules/parts/queries";
import type { BuildStrategy } from "@/modules/builder/queries";

export function StrategyCard({
  title,
  description,
  strategy,
  partLabels,
  highlight,
}: {
  title: string;
  description: string;
  strategy: BuildStrategy;
  partLabels: Record<string, { name: string; category: string; imageUrl: string | null }>;
  highlight?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className={highlight ? "border-primary ring-1 ring-primary" : undefined}>
        <CardHeader>
          <CardTitle className="font-heading text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-2xl font-bold text-primary">
            {formatPrice(strategy.totalPrice)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <StoreIcon className="size-4" />
            {strategy.storeCount} {strategy.storeCount === 1 ? "loja" : "lojas"}
          </p>
          <Button className="mt-4 w-full" onClick={() => setOpen(true)}>
            Ver lojas e comprar
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-x-hidden overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Revise as lojas antes de comprar — cada peça abre em uma aba
              nova só quando você clicar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 overflow-x-hidden">
            {strategy.items.map((item) => {
              const part = partLabels[item.partId];
              return (
                <div
                  key={item.offerId}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-lg border p-3"
                >
                  <div className="flex min-w-0 flex-1 basis-32 items-center gap-2 overflow-hidden">
                    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                      {part?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={part.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImageOff className="size-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {part ? `${PART_CATEGORY_LABELS[part.category] ?? part.category} — ${part.name}` : item.partId}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{item.storeName}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="whitespace-nowrap font-medium">{formatPrice(item.price)}</span>
                    <a
                      href={`/go/${item.offerId}?source=builder`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/80"
                    >
                      Comprar <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
            Alguns desses links são links de afiliados. O Relíquia Hub pode
            receber uma comissão quando uma compra é realizada por meio
            deles, sem custo adicional para você.
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
