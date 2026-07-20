import type { Metadata } from "next";
import { getAllCategoriesFlat } from "@/modules/categories/queries";
import { ListingForm } from "@/components/listings/listing-form";

export const metadata: Metadata = {
  title: "Anunciar item",
};

export default async function NewListingPage() {
  const categories = await getAllCategoriesFlat();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-semibold">Anunciar um item</h1>
        <p className="text-muted-foreground">
          Preencha os detalhes abaixo para publicar sua relíquia para milhares
          de colecionadores.
        </p>
      </div>
      <ListingForm categories={categories} />
    </div>
  );
}
