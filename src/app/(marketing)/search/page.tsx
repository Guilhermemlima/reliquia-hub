import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { searchListings } from "@/modules/search/queries";
import { searchParamsSchema } from "@/modules/search/schema";
import { getAllCategoriesFlat } from "@/modules/categories/queries";
import { ListingCard } from "@/components/listings/listing-card";
import { SearchFilters, SortSelect } from "@/components/search/search-filters";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const metadata: Metadata = {
  title: "Buscar itens",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const normalized = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  );
  const filters = searchParamsSchema.parse(normalized);

  const [{ items, total, pageSize, page }, categories] = await Promise.all([
    searchListings(filters),
    getAllCategoriesFlat(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(targetPage: number) {
    const params = new URLSearchParams(
      normalized as Record<string, string>
    );
    params.set("page", String(targetPage));
    return `/search?${params.toString()}`;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold">
          <SlidersHorizontal className="size-5" />
          {filters.q ? `Resultados para "${filters.q}"` : "Todos os itens"}
        </h1>
        <SortSelect />
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <SearchFilters categories={categories} />
        </aside>

        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            {total} {total === 1 ? "item encontrado" : "itens encontrados"}
          </p>

          {items.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhum item encontrado com esses filtros.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {items.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={pageHref(Math.max(1, page - 1))}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, page - 3), page + 2)
                  .map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink href={pageHref(p)} isActive={p === page}>
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                <PaginationItem>
                  <PaginationNext
                    href={pageHref(Math.min(totalPages, page + 1))}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}
