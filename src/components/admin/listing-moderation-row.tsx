"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { moderateListing } from "@/modules/admin/actions";
import { formatPrice } from "@/lib/format";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  DRAFT: "secondary",
  ACTIVE: "default",
  SOLD: "secondary",
  REMOVED: "destructive",
  FLAGGED: "destructive",
};

export function ListingModerationRow({
  listing,
}: {
  listing: {
    id: string;
    slug: string;
    title: string;
    price: string;
    currency: string;
    status: string;
    seller: { name: string | null; email: string | null };
    category: { name: string };
  };
}) {
  const [isPending, startTransition] = useTransition();

  function update(status: "ACTIVE" | "REMOVED" | "FLAGGED") {
    startTransition(async () => {
      const result = await moderateListing(listing.id, status);
      if (result.error) toast.error(result.error);
      else toast.success("Status atualizado.");
    });
  }

  return (
    <TableRow>
      <TableCell>
        <Link href={`/listings/${listing.slug}`} className="font-medium hover:underline">
          {listing.title}
        </Link>
        <p className="text-xs text-muted-foreground">{listing.category.name}</p>
      </TableCell>
      <TableCell>{listing.seller.name ?? listing.seller.email}</TableCell>
      <TableCell>{formatPrice(listing.price, listing.currency)}</TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[listing.status] ?? "secondary"}>
          {listing.status}
        </Badge>
      </TableCell>
      <TableCell className="space-x-2 text-right">
        {listing.status !== "ACTIVE" && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => update("ACTIVE")}
          >
            Aprovar
          </Button>
        )}
        {listing.status !== "REMOVED" && (
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => update("REMOVED")}
          >
            Remover
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
