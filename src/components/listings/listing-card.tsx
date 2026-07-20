import Link from "next/link";
import { BadgeCheck, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, CONDITION_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ListingCard as ListingCardType } from "@/modules/listings/queries";

export function ListingCard({
  listing,
  className,
}: {
  listing: ListingCardType;
  className?: string;
}) {
  const image = listing.images[0]?.url;
  const sellerName =
    listing.seller.sellerProfile?.storeName ?? listing.seller.name ?? "Vendedor";

  return (
    <Link href={`/listings/${listing.slug}`} className="group block">
      <Card
        className={cn(
          "overflow-hidden py-0 transition-shadow hover:shadow-lg",
          className
        )}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Sem foto
            </div>
          )}
          <button
            type="button"
            aria-label="Favoritar"
            className="absolute top-2 right-2 rounded-full bg-background/85 p-1.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          >
            <Heart className="size-4" />
          </button>
          <Badge className="absolute bottom-2 left-2" variant="secondary">
            {CONDITION_LABELS[listing.condition] ?? listing.condition}
          </Badge>
        </div>
        <div className="space-y-1.5 p-3">
          <p className="line-clamp-2 min-h-10 text-sm font-medium leading-tight">
            {listing.title}
          </p>
          <p className="font-heading text-lg font-semibold text-primary">
            {formatPrice(listing.price.toString(), listing.currency)}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {listing.seller.sellerProfile?.verified && (
              <BadgeCheck className="size-3.5 text-success" />
            )}
            <span className="truncate">{sellerName}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
