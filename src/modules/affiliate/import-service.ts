import { prisma } from "@/lib/prisma";
import { isUrlAllowedForStore } from "@/modules/affiliate/domain-validation";
import type { OfferCsvRow } from "@/modules/affiliate/csv";

export const MAX_IMPORT_ROWS = 500;

export type ImportRowResult = {
  row: number;
  status: "created" | "duplicate" | "error";
  message: string;
};

export type ImportSummary = {
  total: number;
  created: number;
  duplicates: number;
  errors: number;
  results: ImportRowResult[];
};

/**
 * Núcleo da importação em lote — separado do server action (`import-actions.ts`)
 * para poder ser exercitado sem precisar de uma sessão HTTP autenticada
 * (ex: scripts de verificação).
 */
export async function processOfferImportRows(
  rows: OfferCsvRow[]
): Promise<ImportSummary | { error: string }> {
  if (rows.length === 0) return { error: "Nenhuma linha para importar." };
  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      error: `Máximo de ${MAX_IMPORT_ROWS} linhas por importação — divida o arquivo em partes menores.`,
    };
  }

  const [parts, stores] = await Promise.all([
    prisma.part.findMany({ select: { id: true, slug: true } }),
    prisma.store.findMany({ select: { id: true, slug: true, allowedDomains: true } }),
  ]);
  const partBySlug = new Map(parts.map((p) => [p.slug, p]));
  const storeBySlug = new Map(stores.map((s) => [s.slug, s]));

  const results: ImportRowResult[] = [];
  let created = 0;
  let duplicates = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2; // +1 header, +1 linha 1-based
    const row = rows[i];

    const part = partBySlug.get(row.part_slug);
    const store = storeBySlug.get(row.store_slug);
    const price = Number(row.price);

    if (!part) {
      results.push({ row: rowNumber, status: "error", message: `Peça "${row.part_slug}" não encontrada.` });
      errors++;
      continue;
    }
    if (!store) {
      results.push({ row: rowNumber, status: "error", message: `Loja "${row.store_slug}" não encontrada.` });
      errors++;
      continue;
    }
    if (!row.original_url || Number.isNaN(price) || price <= 0) {
      results.push({ row: rowNumber, status: "error", message: "Preço ou URL original inválidos." });
      errors++;
      continue;
    }

    const originalCheck = isUrlAllowedForStore(row.original_url, store.allowedDomains);
    if (!originalCheck.ok) {
      results.push({ row: rowNumber, status: "error", message: originalCheck.error });
      errors++;
      continue;
    }

    const affiliateUrl = row.affiliate_url || row.original_url;
    if (row.affiliate_url) {
      const affiliateCheck = isUrlAllowedForStore(row.affiliate_url, store.allowedDomains);
      if (!affiliateCheck.ok) {
        results.push({ row: rowNumber, status: "error", message: affiliateCheck.error });
        errors++;
        continue;
      }
    }

    const existing = await prisma.offer.findFirst({
      where: { partId: part.id, storeId: store.id, originalUrl: row.original_url },
      select: { id: true },
    });
    if (existing) {
      results.push({ row: rowNumber, status: "duplicate", message: "Oferta já cadastrada — ignorada." });
      duplicates++;
      continue;
    }

    const pixPrice = row.pix_price ? Number(row.pix_price) : undefined;
    const shippingPrice = row.shipping_price ? Number(row.shipping_price) : undefined;
    const condition = ["NEW", "USED", "REFURBISHED"].includes(row.condition)
      ? (row.condition as "NEW" | "USED" | "REFURBISHED")
      : "NEW";
    const availability = ["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"].includes(row.availability)
      ? (row.availability as "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN")
      : "UNKNOWN";

    await prisma.offer.create({
      data: {
        partId: part.id,
        storeId: store.id,
        sellerName: row.seller_name || undefined,
        normalPrice: price,
        pixPrice: pixPrice && !Number.isNaN(pixPrice) ? pixPrice : undefined,
        shippingPrice: shippingPrice && !Number.isNaN(shippingPrice) ? shippingPrice : undefined,
        condition,
        availability,
        originalUrl: row.original_url,
        affiliateUrl,
        source: "MANUAL",
        priceHistory: {
          create: {
            normalPrice: price,
            pixPrice: pixPrice && !Number.isNaN(pixPrice) ? pixPrice : undefined,
            shippingPrice: shippingPrice && !Number.isNaN(shippingPrice) ? shippingPrice : undefined,
            availability,
          },
        },
      },
    });
    results.push({ row: rowNumber, status: "created", message: "Oferta criada." });
    created++;
  }

  return { total: rows.length, created, duplicates, errors, results };
}
