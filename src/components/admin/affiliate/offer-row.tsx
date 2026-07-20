"use client";

import { useTransition } from "react";
import { toast } from "sonner";
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
      <TableCell>{offer.partName}</TableCell>
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
