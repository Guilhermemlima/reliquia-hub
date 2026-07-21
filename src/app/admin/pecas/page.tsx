import Link from "next/link";
import type { Metadata } from "next";
import { ImageOff } from "lucide-react";
import {
  getPartsForCuration,
  getPartsCatalogStats,
  PART_CATEGORY_LABELS,
} from "@/modules/parts/queries";
import { getActiveStores } from "@/modules/affiliate/queries";
import { partCategories } from "@/modules/parts/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewPartDialog } from "@/components/admin/parts/new-part-dialog";
import { PartOfferDialog } from "@/components/admin/parts/part-offer-dialog";
import { PartImageDialog } from "@/components/admin/parts/part-image-dialog";

export const metadata: Metadata = { title: "Peças · Admin" };

export default async function AdminPartsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; missing?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.q?.trim() || undefined;
  const category = params.category && params.category !== "all" ? params.category : undefined;
  const onlyWithoutOffers = params.missing === "1";

  const [{ parts, total, totalPages }, stats, stores] = await Promise.all([
    getPartsForCuration({ page, search, category, onlyWithoutOffers }),
    getPartsCatalogStats(),
    getActiveStores(),
  ]);

  const storeOptions = stores.map((s) => ({ id: s.id, name: s.name }));

  function pageHref(targetPage: number) {
    const sp = new URLSearchParams();
    if (search) sp.set("q", search);
    if (category) sp.set("category", category);
    if (onlyWithoutOffers) sp.set("missing", "1");
    sp.set("page", String(targetPage));
    return `/admin/pecas?${sp.toString()}`;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Catálogo de peças</h1>
          <p className="text-sm text-muted-foreground">
            {stats.total} peças no catálogo · {stats.withoutOffers} ainda sem link associado
          </p>
        </div>
        <NewPartDialog />
      </div>

      <form className="mb-4 flex flex-wrap items-end gap-2" method="get">
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-xs text-muted-foreground">
            Buscar
          </label>
          <Input id="q" name="q" defaultValue={search} placeholder="Nome, marca ou modelo" className="w-64" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-xs text-muted-foreground">
            Categoria
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category ?? "all"}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">Todas</option>
            {partCategories.map((c) => (
              <option key={c} value={c}>
                {PART_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <label className="flex h-9 items-center gap-2 text-sm">
          <input type="checkbox" name="missing" value="1" defaultChecked={onlyWithoutOffers} />
          Só sem link
        </label>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      {parts.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma peça encontrada com esse filtro.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Peça</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Links</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                        {part.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={part.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageOff className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{part.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{part.brand}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{PART_CATEGORY_LABELS[part.category] ?? part.category}</TableCell>
                  <TableCell>
                    {part._count.offers > 0 ? (
                      <Badge variant="secondary">{part._count.offers} oferta(s)</Badge>
                    ) : (
                      <Badge variant="outline">Sem link</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <PartImageDialog
                        partId={part.id}
                        partName={part.name}
                        currentImageUrl={part.imageUrl}
                      />
                      <PartOfferDialog
                        partId={part.id}
                        partName={part.name}
                        stores={storeOptions}
                        offerCount={part._count.offers}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {page} de {totalPages} · {total} peças no filtro atual
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={pageHref(page - 1)}>
                <Button variant="outline" size="sm">
                  Anterior
                </Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={pageHref(page + 1)}>
                <Button variant="outline" size="sm">
                  Próxima
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
