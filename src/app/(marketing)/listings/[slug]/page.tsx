import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MessageCircle, ShieldCheck, Star } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  getListingBySlug,
  getRelatedListings,
  incrementViewCount,
} from "@/modules/listings/queries";
import { isFavorited } from "@/modules/favorites/queries";
import { CONDITION_LABELS, formatDate, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ReportDialog } from "@/components/listings/report-dialog";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { ListingCard } from "@/components/listings/listing-card";
import type { CategoryAttributeField } from "@/modules/categories/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
    openGraph: {
      images: listing.images[0] ? [listing.images[0].url] : [],
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [listing, session] = await Promise.all([
    getListingBySlug(slug),
    auth(),
  ]);

  if (!listing || listing.status === "REMOVED") notFound();

  incrementViewCount(listing.id).catch(() => {});

  const [favorited, related] = await Promise.all([
    isFavorited(session?.user?.id, listing.id),
    getRelatedListings(listing.categoryId, listing.id),
  ]);

  const attributeFields = Array.isArray(listing.category.attributesSchema)
    ? (listing.category.attributesSchema as CategoryAttributeField[])
    : [];
  const attributeValues = (listing.attributes as Record<string, string | number>) ?? {};
  const isOwner = session?.user?.id === listing.sellerId;
  const sellerProfile = listing.seller.sellerProfile;
  const sellerLabel = sellerProfile?.storeName ?? listing.seller.name ?? "Vendedor";

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/">Início</Link> /{" "}
        <Link href={`/search?category=${listing.category.slug}`}>
          {listing.category.name}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListingGallery images={listing.images} title={listing.title} />

          <div className="mt-6 space-y-4">
            <h2 className="font-heading text-xl font-semibold">Descrição</h2>
            <p className="whitespace-pre-line text-muted-foreground">
              {listing.description}
            </p>

            {attributeFields.length > 0 && (
              <>
                <Separator />
                <h2 className="font-heading text-xl font-semibold">
                  Especificações
                </h2>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {attributeFields.map((field) => {
                    const value = attributeValues[field.key];
                    if (value === undefined || value === "") return null;
                    return (
                      <div key={field.key} className="rounded-lg border p-3">
                        <dt className="text-xs text-muted-foreground">
                          {field.label}
                        </dt>
                        <dd className="text-sm font-medium">{value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </>
            )}
          </div>

          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-heading text-xl font-semibold">
                Você também pode gostar
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {related.map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {CONDITION_LABELS[listing.condition] ?? listing.condition}
                </Badge>
                <h1 className="font-heading text-2xl font-semibold leading-tight">
                  {listing.title}
                </h1>
              </div>
              <p className="font-heading text-3xl font-bold text-primary">
                {formatPrice(listing.price.toString(), listing.currency)}
              </p>
              <p className="text-xs text-muted-foreground">
                Anunciado em {formatDate(listing.createdAt)} ·{" "}
                {listing.viewCount} visualizações
              </p>

              {isOwner ? (
                <Button
                  size="lg"
                  className="w-full"
                  render={<Link href={`/sell/${listing.id}/edit`} />}
                >
                  Editar anúncio
                </Button>
              ) : (
                <div className="grid gap-2">
                  <Button
                    size="lg"
                    className="w-full"
                    render={<Link href={`/checkout/${listing.id}`} />}
                  >
                    Comprar agora
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    render={
                      <Link href={`/dashboard/messages/new?listingId=${listing.id}`} />
                    }
                  >
                    <MessageCircle /> Conversar com o vendedor
                  </Button>
                  <FavoriteButton
                    listingId={listing.id}
                    initialFavorited={favorited}
                    isLoggedIn={Boolean(session?.user)}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-success" />
                Pagamento processado com segurança. O valor só é liberado ao
                vendedor após a confirmação do recebimento.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Link
                href={sellerProfile ? `/seller/${sellerProfile.slug}` : "#"}
                className="flex items-center gap-3"
              >
                <Avatar className="size-12">
                  <AvatarImage src={listing.seller.image ?? undefined} />
                  <AvatarFallback>{sellerLabel.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1 font-medium">
                    {sellerLabel}
                    {sellerProfile?.verified && (
                      <BadgeCheck className="size-4 text-success" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3.5 fill-primary text-primary" />
                    {sellerProfile
                      ? `${sellerProfile.ratingAvg.toFixed(1)} (${sellerProfile.ratingCount})`
                      : "Novo vendedor"}
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {!isOwner && (
            <div className="flex justify-center">
              <ReportDialog listingId={listing.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
