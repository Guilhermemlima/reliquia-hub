"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ImageOff } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setOfferStatus } from "@/modules/affiliate/actions";
import { formatPrice, formatDate } from "@/lib/format";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  EXPIRED: "destructive",
  PENDING_REVIEW: "secondary",
};

const CHECK_STATUS_LABELS: Record<string, string> = {
  NEVER: "Nunca verificado",
  OK: "Preço em dia",
  NOT_FOUND: "Não encontrado",
  SUSPICIOUS: "Preço suspeito — confira manualmente",
  ERROR: "Erro na última busca",
};

export function OfferRow({
  offer,
}: {
  offer: {
    id: string;
    partName: string;
    partImageUrl: string | null;
    storeName: string;
    price: string | null;
    highestPrice: string | null;
    discountPercent: number | null;
    priceCheckStatus: string | null;
    status: string;
    updatedAt: string;
    clicks: number;
  };
}) {
  const [isPending, startTransition] = useTransition();

  function update(status: "ACTIVE" | "INACTIVE") {
    startTransition(async () => {
      const result = await setOfferStatus(offer.id, status);
      if (result.error) toast.error(result.error);
      else toast.success("Status atualizado.");
    });
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
            {offer.partImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={offer.partImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageOff className="size-3.5 text-muted-foreground" />
            )}
          </div>
          <span>{offer.partName}</span>
        </div>
      </TableCell>
      <TableCell>{offer.storeName}</TableCell>
      <TableCell>
        {offer.price ? (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatPrice(offer.price)}</span>
              {offer.discountPercent ? (
                <Badge variant="default" className="bg-success text-success-foreground">
                  -{offer.discountPercent}%
                </Badge>
              ) : null}
            </div>
            {offer.highestPrice && offer.discountPercent ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(offer.highestPrice)}
              </span>
            ) : null}
            {offer.priceCheckStatus === "SUSPICIOUS" ? (
              <span className="text-xs text-destructive">
                {CHECK_STATUS_LABELS.SUSPICIOUS}
              </span>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">
            {CHECK_STATUS_LABELS[offer.priceCheckStatus ?? "NEVER"]}
          </span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[offer.status] ?? "secondary"}>{offer.status}</Badge>
      </TableCell>
      <TableCell>{formatDate(offer.updatedAt)}</TableCell>
      <TableCell>{offer.clicks}</TableCell>
      <TableCell className="text-right">
        {offer.status === "ACTIVE" ? (
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => update("INACTIVE")}>
            Desativar
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => update("ACTIVE")}>
            Ativar
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
