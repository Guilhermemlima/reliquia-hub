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

export function OfferRow({
  offer,
}: {
  offer: {
    id: string;
    partName: string;
    partImageUrl: string | null;
    storeName: string;
    price: string;
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
      <TableCell>{formatPrice(offer.price)}</TableCell>
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
