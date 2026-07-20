import Link from "next/link";
import { ArrowRight, Gavel, MessageCircle, ShieldCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/layout/search-bar";
import { ListingCard } from "@/components/listings/listing-card";
import { getFeaturedListings, getLatestListings } from "@/modules/listings/queries";
import { getCategoryTree } from "@/modules/categories/queries";

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    getFeaturedListings(8),
    getLatestListings(8),
    getCategoryTree(),
  ]);

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-accent/40 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="mx-auto max-w-3xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            O marketplace feito para{" "}
            <span className="text-primary">colecionadores</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Videogames antigos, cards, action figures, quadrinhos, moedas,
            vinis e muito mais — compre e venda com segurança, reputação e
            gente que entende do assunto.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar />
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Button size="lg" render={<Link href="/search" />}>
              Explorar itens <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/sell/new" />}>
              Anunciar um item
            </Button>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <h2 className="mb-4 font-heading text-2xl font-semibold">
            Categorias
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.slice(0, 12).map((category) => (
              <Link key={category.id} href={`/search?category=${category.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
                    <span className="font-medium">{category.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-2xl font-semibold">
              <TrendingUp className="size-5 text-primary" /> Em alta
            </h2>
            <Link href="/search" className="text-sm text-primary">
              Ver tudo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <h2 className="mb-4 font-heading text-2xl font-semibold">
            Novidades
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {latest.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {featured.length === 0 && latest.length === 0 && (
        <section className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Ainda não há anúncios ativos.{" "}
          <Link href="/sell/new" className="text-primary underline">
            Seja o primeiro a anunciar
          </Link>
          .
        </section>
      )}

      <section className="border-t bg-muted/30">
        <div className="container mx-auto grid gap-8 px-4 py-14 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="mb-3 size-8 text-primary" />
            <h3 className="font-heading text-lg font-semibold">
              Pagamento protegido
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              O valor fica retido com segurança e só é liberado ao vendedor
              após você confirmar o recebimento.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <MessageCircle className="mb-3 size-8 text-primary" />
            <h3 className="font-heading text-lg font-semibold">
              Fale direto com o vendedor
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tire dúvidas sobre estado de conservação, autenticidade e
              histórico antes de comprar.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Gavel className="mb-3 size-8 text-primary" />
            <h3 className="font-heading text-lg font-semibold">
              Reputação de verdade
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Avaliações de compradores e vendedores constroem confiança em
              cada transação.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
