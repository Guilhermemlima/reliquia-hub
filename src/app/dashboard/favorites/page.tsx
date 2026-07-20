import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserFavorites } from "@/modules/favorites/queries";
import { ListingCard } from "@/components/listings/listing-card";

export const metadata: Metadata = { title: "Favoritos" };

export default async function DashboardFavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const favorites = await getUserFavorites(session.user.id);

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-semibold">Favoritos</h1>
      {favorites.length === 0 ? (
        <p className="text-muted-foreground">
          Você ainda não favoritou nenhum item.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {favorites.map((favorite) => (
            <ListingCard key={favorite.id} listing={favorite.listing} />
          ))}
        </div>
      )}
    </div>
  );
}
