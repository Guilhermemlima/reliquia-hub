import type { Metadata } from "next";
import { getAllListingsForModeration } from "@/modules/admin/queries";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListingModerationRow } from "@/components/admin/listing-moderation-row";

export const metadata: Metadata = { title: "Anúncios · Admin" };

export default async function AdminListingsPage() {
  const listings = await getAllListingsForModeration();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-semibold">
        Moderação de anúncios
      </h1>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <ListingModerationRow
                key={listing.id}
                listing={{
                  id: listing.id,
                  slug: listing.slug,
                  title: listing.title,
                  price: listing.price.toString(),
                  currency: listing.currency,
                  status: listing.status,
                  seller: listing.seller,
                  category: listing.category,
                }}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
