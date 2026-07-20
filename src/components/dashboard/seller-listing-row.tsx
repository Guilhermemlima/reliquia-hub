"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/format";
import { setListingStatus } from "@/modules/listings/actions";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  SOLD: "Vendido",
  REMOVED: "Removido",
  FLAGGED: "Sinalizado",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  DRAFT: "secondary",
  ACTIVE: "default",
  SOLD: "secondary",
  REMOVED: "destructive",
  FLAGGED: "destructive",
};

export function SellerListingRow({
  listing,
}: {
  listing: {
    id: string;
    slug: string;
    title: string;
    price: string | number;
    currency: string;
    status: string;
    viewCount: number;
    images: { url: string }[];
  };
}) {
  const [isPending, startTransition] = useTransition();

  function updateStatus(status: "ACTIVE" | "DRAFT" | "REMOVED") {
    startTransition(async () => {
      const result = await setListingStatus(listing.id, status);
      if (result.error) toast.error(result.error);
      else toast.success("Status atualizado.");
    });
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
            {listing.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.images[0].url}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <Link href={`/listings/${listing.slug}`} className="line-clamp-2 font-medium hover:underline">
            {listing.title}
          </Link>
        </div>
      </TableCell>
      <TableCell>{formatPrice(listing.price.toString(), listing.currency)}</TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[listing.status] ?? "secondary"}>
          {STATUS_LABEL[listing.status] ?? listing.status}
        </Badge>
      </TableCell>
      <TableCell>{listing.viewCount}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger disabled={isPending}>
            <Button variant="ghost" size="icon" disabled={isPending}>
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={`/sell/${listing.id}/edit`} />}>
              Editar
            </DropdownMenuItem>
            {listing.status === "ACTIVE" ? (
              <DropdownMenuItem onSelect={() => updateStatus("DRAFT")}>
                Pausar anúncio
              </DropdownMenuItem>
            ) : (
              listing.status !== "REMOVED" && (
                <DropdownMenuItem onSelect={() => updateStatus("ACTIVE")}>
                  Publicar
                </DropdownMenuItem>
              )
            )}
            {listing.status !== "REMOVED" && (
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => updateStatus("REMOVED")}
              >
                Remover
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
