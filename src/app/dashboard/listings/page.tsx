import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { getSellerListings } from "@/modules/listings/queries";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SellerListingRow } from "@/components/dashboard/seller-listing-row";

export const metadata: Metadata = { title: "Meus anúncios" };

export default async function DashboardListingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const listings = await getSellerListings(session.user.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Meus anúncios</h1>
        <Button render={<Link href="/sell/new" />}>
          <Plus /> Novo anúncio
        </Button>
      </div>

      {listings.length === 0 ? (
        <p className="text-muted-foreground">
          Você ainda não publicou nenhum item.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visualizações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <SellerListingRow
                  key={listing.id}
                  listing={{
                    id: listing.id,
                    slug: listing.slug,
                    title: listing.title,
                    price: listing.price.toString(),
                    currency: listing.currency,
                    status: listing.status,
                    viewCount: listing.viewCount,
                    images: listing.images,
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
