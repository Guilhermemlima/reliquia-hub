import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, Star, CalendarDays } from "lucide-react";
import { getSellerBySlug, getSellerReviews } from "@/modules/sellers/queries";
import { getPublicSellerListings } from "@/modules/listings/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listings/listing-card";
import { formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seller = await getSellerBySlug(slug);
  return { title: seller?.storeName ?? "Vendedor" };
}

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const seller = await getSellerBySlug(slug);
  if (!seller) notFound();

  const [listings, reviews] = await Promise.all([
    getPublicSellerListings(seller.userId),
    getSellerReviews(seller.userId),
  ]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Card className="mb-8">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center sm:flex-row sm:text-left">
          <Avatar className="size-20">
            <AvatarImage src={seller.user.image ?? undefined} />
            <AvatarFallback className="text-xl">
              {seller.storeName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="font-heading text-2xl font-semibold">
                {seller.storeName}
              </h1>
              {seller.verified && (
                <Badge className="gap-1 bg-success text-success-foreground">
                  <BadgeCheck className="size-3.5" /> Vendedor verificado
                </Badge>
              )}
            </div>
            {seller.bio && (
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {seller.bio}
              </p>
            )}
            <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-primary text-primary" />
                {seller.ratingAvg.toFixed(1)} ({seller.ratingCount} avaliações)
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="size-4" />
                Na plataforma desde {formatDate(seller.user.createdAt)}
              </span>
              <span>{seller.totalSales} vendas concluídas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-4 font-heading text-xl font-semibold">
        Itens à venda ({listings.length})
      </h2>
      {listings.length === 0 ? (
        <p className="text-muted-foreground">
          Este vendedor não tem itens ativos no momento.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-semibold">
            Avaliações
          </h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={review.author.image ?? undefined} />
                      <AvatarFallback>
                        {(review.author.name ?? "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{review.author.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={
                              i < review.rating
                                ? "size-3.5 fill-primary text-primary"
                                : "size-3.5 text-muted-foreground/40"
                            }
                          />
                        ))}
                        <span>· {formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  )}
                  {review.order.listing && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Sobre: {review.order.listing.title}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
