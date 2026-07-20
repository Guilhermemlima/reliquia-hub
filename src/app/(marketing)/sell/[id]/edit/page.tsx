import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getListingById } from "@/modules/listings/queries";
import { getAllCategoriesFlat } from "@/modules/categories/queries";
import { ListingForm } from "@/components/listings/listing-form";
import type { ListingInput } from "@/modules/listings/schema";

export const metadata: Metadata = {
  title: "Editar anúncio",
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [listing, categories] = await Promise.all([
    getListingById(id),
    getAllCategoriesFlat(),
  ]);

  if (!listing) notFound();
  if (listing.sellerId !== session.user.id && session.user.role !== "ADMIN") {
    notFound();
  }

  const defaultValues: Partial<ListingInput> = {
    title: listing.title,
    description: listing.description,
    categoryId: listing.categoryId,
    condition: listing.condition,
    price: Number(listing.price),
    quantity: listing.quantity,
    attributes: (listing.attributes as Record<string, string | number>) ?? {},
    images: listing.images.map((image) => ({
      url: image.url,
      publicId: image.publicId ?? undefined,
    })),
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-semibold">Editar anúncio</h1>
        <p className="text-muted-foreground">
          Atualize as informações do seu item.
        </p>
      </div>
      <ListingForm
        categories={categories}
        listingId={listing.id}
        defaultValues={defaultValues}
      />
    </div>
  );
}
