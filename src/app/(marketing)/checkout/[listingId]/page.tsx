import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getListingById } from "@/modules/listings/queries";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, CONDITION_LABELS } from "@/lib/format";
import { CheckoutButton } from "@/components/checkout/checkout-button";

export const metadata: Metadata = { title: "Finalizar compra" };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const listing = await getListingById(listingId);
  if (!listing || listing.status !== "ACTIVE") notFound();

  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 font-heading text-2xl font-semibold">
        Finalizar compra
      </h1>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex gap-3">
            <div className="size-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
              {listing.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.images[0].url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              <p className="font-medium">{listing.title}</p>
              <p className="text-xs text-muted-foreground">
                {CONDITION_LABELS[listing.condition] ?? listing.condition}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(listing.price.toString(), listing.currency)}</span>
          </div>

          <CheckoutButton listingId={listing.id} />

          <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
            O valor fica retido com segurança e só é repassado ao vendedor
            depois que você confirmar o recebimento do item.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
