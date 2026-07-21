import { Prisma, type Part, type PartCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isUrlAllowedForStore } from "@/modules/affiliate/domain-validation";
import { matchPartForRow, AUTO_MATCH_THRESHOLD } from "@/modules/affiliate/matching";
import { fetchLinkPreview } from "@/modules/affiliate/link-preview";
import { uniqueSlug } from "@/lib/slug";
import type { OfferCsvRow } from "@/modules/affiliate/csv";

export const MAX_IMPORT_ROWS = 500;

const PART_CATEGORIES = new Set<PartCategory>([
  "CPU", "GPU", "RAM", "STORAGE", "PSU", "MOTHERBOARD", "CASE", "COOLER", "MONITOR", "PERIPHERAL",
]);

export type ImportRowResult = {
  row: number;
  status: "created" | "duplicate" | "pending_review" | "error";
  message: string;
};

export type ImportSummary = {
  total: number;
  created: number;
  duplicates: number;
  pendingReview: number;
  errors: number;
  results: ImportRowResult[];
};

function buildOfferData(params: {
  partId: string;
  storeId: string;
  row: OfferCsvRow;
  price: number;
  affiliateUrl: string;
}) {
  const { row, price } = params;
  const pixPrice = row.pix_price ? Number(row.pix_price) : undefined;
  const shippingPrice = row.shipping_price ? Number(row.shipping_price) : undefined;
  const condition = ["NEW", "USED", "REFURBISHED"].includes(row.condition)
    ? (row.condition as "NEW" | "USED" | "REFURBISHED")
    : "NEW";
  const availability = ["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"].includes(row.availability)
    ? (row.availability as "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN")
    : "UNKNOWN";

  return {
    partId: params.partId,
    storeId: params.storeId,
    sellerName: row.seller_name || undefined,
    normalPrice: price,
    pixPrice: pixPrice && !Number.isNaN(pixPrice) ? pixPrice : undefined,
    shippingPrice: shippingPrice && !Number.isNaN(shippingPrice) ? shippingPrice : undefined,
    condition,
    availability,
    originalUrl: row.original_url,
    affiliateUrl: params.affiliateUrl,
  };
}

/**
 * Núcleo da importação em lote — separado do server action (`import-actions.ts`)
 * para poder ser exercitado sem precisar de uma sessão HTTP autenticada
 * (ex: scripts de verificação).
 *
 * Quando `part_slug` vem em branco, tenta associação automática por
 * EAN/MPN/marca+modelo/nome aproximado (`matching.ts`). Acima do limiar de
 * confiança, a oferta é criada direto; abaixo dele, mas com algum sinal
 * plausível, a linha vira uma `OfferMatchReview` pendente em vez de ser
 * descartada. Sem nenhum candidato, mas com `part_category` + nome
 * informado, uma peça nova é criada no catálogo (usando a prévia pública
 * do link — título/imagem — quando faltar informação).
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

  const [initialParts, stores] = await Promise.all([
    prisma.part.findMany(),
    prisma.store.findMany({ select: { id: true, slug: true, allowedDomains: true } }),
  ]);
  const parts: Part[] = [...initialParts];
  const partBySlug = new Map(parts.map((p) => [p.slug, p]));
  const storeBySlug = new Map(stores.map((s) => [s.slug, s]));
  const previewCache = new Map<string, Awaited<ReturnType<typeof fetchLinkPreview>>>();

  async function getPreview(url: string) {
    if (previewCache.has(url)) return previewCache.get(url) ?? null;
    const preview = await fetchLinkPreview(url);
    previewCache.set(url, preview);
    return preview;
  }

  /** Preenche a imagem da peça se ela ainda não tiver uma — best-effort. */
  async function backfillPartImage(part: Part, sourceUrl: string) {
    if (part.imageUrl) return;
    const preview = await getPreview(sourceUrl);
    if (!preview?.image) return;
    await prisma.part.update({ where: { id: part.id }, data: { imageUrl: preview.image } });
    part.imageUrl = preview.image;
  }

  const results: ImportRowResult[] = [];
  let created = 0;
  let duplicates = 0;
  let pendingReview = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2; // +1 header, +1 linha 1-based
    const row = rows[i];

    const store = storeBySlug.get(row.store_slug);
    const price = Number(row.price);

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

    let part: Part | undefined = row.part_slug ? partBySlug.get(row.part_slug) : undefined;
    let newPartLabel = "";

    if (!part && !row.part_slug) {
      const match = matchPartForRow(
        {
          ean: row.ean || undefined,
          mpn: row.mpn || undefined,
          brand: row.part_brand || undefined,
          model: row.part_model || undefined,
          label: row.part_title || "",
        },
        parts
      );

      if (match && match.confidence >= AUTO_MATCH_THRESHOLD) {
        part = parts.find((p) => p.id === match.partId);
      } else if (match) {
        const existingOffer = await prisma.offer.findFirst({
          where: { storeId: store.id, originalUrl: row.original_url },
          select: { id: true },
        });
        if (existingOffer) {
          results.push({ row: rowNumber, status: "duplicate", message: "Oferta já cadastrada — ignorada." });
          duplicates++;
          continue;
        }

        await prisma.offerMatchReview.create({
          data: {
            rawLabel: row.part_title || row.part_model || row.original_url,
            candidatePartId: match.partId,
            confidenceScore: match.confidence,
            matchMethod: match.method,
            payload: buildOfferData({
              partId: match.partId,
              storeId: store.id,
              row,
              price,
              affiliateUrl,
            }) as unknown as Prisma.InputJsonValue,
          },
        });
        results.push({
          row: rowNumber,
          status: "pending_review",
          message: `Associação com ${Math.round(match.confidence * 100)}% de confiança — enviada para revisão.`,
        });
        pendingReview++;
        continue;
      } else {
        // Nenhum candidato existente — tenta criar uma peça nova.
        const category = row.part_category?.toUpperCase() as PartCategory | undefined;
        const hasBasicInfo = row.part_title || (row.part_brand && row.part_model);

        if (!category || !PART_CATEGORIES.has(category) || !hasBasicInfo) {
          results.push({
            row: rowNumber,
            status: "error",
            message:
              "Nenhuma peça encontrada e não foi possível criar uma nova (informe part_category válida + part_title ou part_brand/part_model).",
          });
          errors++;
          continue;
        }

        // Prioridade do nome: título explícito > marca+modelo explícitos >
        // título da prévia do link (só como último recurso, nunca deve
        // sobrepor o que a pessoa já informou).
        const brandModelTitle =
          row.part_brand && row.part_model ? `${row.part_brand} ${row.part_model}` : undefined;
        const needsPreview = !row.part_title && !brandModelTitle;
        const preview = needsPreview ? await getPreview(row.original_url) : null;
        const title = row.part_title || brandModelTitle || preview?.title;

        if (!title) {
          results.push({
            row: rowNumber,
            status: "error",
            message:
              "Não foi possível determinar o nome do produto (informe part_title ou part_brand/part_model, ou verifique se o link permite gerar prévia).",
          });
          errors++;
          continue;
        }

        const brand = row.part_brand || "Genérico";
        const model = row.part_model || title;
        const slug = await uniqueSlug(title, async (candidate) =>
          Boolean(await prisma.part.findUnique({ where: { slug: candidate } }))
        );
        const imagePreview = preview ?? (await getPreview(row.original_url));

        const newPart = await prisma.part.create({
          data: {
            category,
            brand,
            model,
            name: title,
            slug,
            ean: row.ean || undefined,
            mpn: row.mpn || undefined,
            imageUrl: imagePreview?.image,
          },
        });

        parts.push(newPart);
        partBySlug.set(newPart.slug, newPart);
        part = newPart;
        newPartLabel = ` (peça nova criada: "${title}")`;
      }
    }

    if (!part) {
      results.push({ row: rowNumber, status: "error", message: `Peça "${row.part_slug}" não encontrada.` });
      errors++;
      continue;
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

    if (!newPartLabel) {
      await backfillPartImage(part, row.original_url);
    }

    const data = buildOfferData({ partId: part.id, storeId: store.id, row, price, affiliateUrl });
    await prisma.offer.create({
      data: {
        ...data,
        source: "MANUAL",
        priceHistory: {
          create: {
            normalPrice: data.normalPrice,
            pixPrice: data.pixPrice,
            shippingPrice: data.shippingPrice,
            availability: data.availability,
          },
        },
      },
    });
    results.push({ row: rowNumber, status: "created", message: `Oferta criada.${newPartLabel}` });
    created++;
  }

  return { total: rows.length, created, duplicates, pendingReview, errors, results };
}
