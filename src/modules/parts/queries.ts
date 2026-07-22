import { prisma } from "@/lib/prisma";

export const PART_CATEGORY_LABELS: Record<string, string> = {
  CPU: "Processador",
  GPU: "Placa de vídeo",
  RAM: "Memória RAM",
  STORAGE: "Armazenamento",
  PSU: "Fonte",
  MOTHERBOARD: "Placa-mãe",
  CASE: "Gabinete",
  COOLER: "Cooler",
  MONITOR: "Monitor",
  PERIPHERAL: "Periférico",
};

export const PART_CATEGORY_ORDER = [
  "CPU",
  "GPU",
  "MOTHERBOARD",
  "RAM",
  "STORAGE",
  "PSU",
  "CASE",
  "COOLER",
  "MONITOR",
] as const;

export async function getAllParts() {
  return prisma.part.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
}

export async function getPartsByCategory() {
  const parts = await getAllParts();
  const grouped = new Map<string, typeof parts>();
  for (const part of parts) {
    const list = grouped.get(part.category) ?? [];
    list.push(part);
    grouped.set(part.category, list);
  }
  return PART_CATEGORY_ORDER.filter((c) => grouped.has(c)).map((category) => ({
    category,
    label: PART_CATEGORY_LABELS[category],
    parts: grouped.get(category) ?? [],
  }));
}

/**
 * Peças pro Montador de PC: só campos leves (sem `specs`, que pode ser um
 * JSON grande vindo do catálogo importado) e só peças com pelo menos uma
 * oferta ativa — sem isso não dá pra montar nenhuma estratégia de compra.
 * `getPartsByCategory`/`getAllParts` sem filtro ficaram grandes demais pra
 * essa página depois da importação em massa do catálogo (~2.400 peças).
 */
export async function getBuilderParts() {
  const parts = await prisma.part.findMany({
    where: {
      category: { in: [...PART_CATEGORY_ORDER] },
      offers: { some: { status: "ACTIVE", normalPrice: { not: null } } },
    },
    select: {
      id: true,
      category: true,
      brand: true,
      model: true,
      name: true,
      imageUrl: true,
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const grouped = new Map<string, typeof parts>();
  for (const part of parts) {
    const list = grouped.get(part.category) ?? [];
    list.push(part);
    grouped.set(part.category, list);
  }
  return PART_CATEGORY_ORDER.filter((c) => grouped.has(c)).map((category) => ({
    category,
    label: PART_CATEGORY_LABELS[category],
    parts: grouped.get(category) ?? [],
  }));
}

export async function getPartBySlug(slug: string) {
  return prisma.part.findUnique({ where: { slug } });
}

export async function getPartById(id: string) {
  return prisma.part.findUnique({ where: { id } });
}

const PARTS_PAGE_SIZE = 30;

export async function getPartsForCuration(params: {
  page?: number;
  search?: string;
  category?: string;
  onlyWithoutOffers?: boolean;
}) {
  const page = Math.max(1, params.page ?? 1);
  const where = {
    ...(params.category ? { category: params.category as never } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { brand: { contains: params.search, mode: "insensitive" as const } },
            { model: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(params.onlyWithoutOffers ? { offers: { none: {} } } : {}),
  };

  const [parts, total] = await Promise.all([
    prisma.part.findMany({
      where,
      orderBy: [{ category: "asc" }, { name: "asc" }],
      skip: (page - 1) * PARTS_PAGE_SIZE,
      take: PARTS_PAGE_SIZE,
      include: { _count: { select: { offers: true } } },
    }),
    prisma.part.count({ where }),
  ]);

  return {
    parts,
    total,
    page,
    pageSize: PARTS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PARTS_PAGE_SIZE)),
  };
}

/** Lista leve (sem `specs`) pra popular dropdowns de peça no admin. */
export async function getPartOptions() {
  return prisma.part.findMany({
    select: { id: true, name: true, category: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export async function getPartsCatalogStats() {
  const [total, withoutOffers] = await Promise.all([
    prisma.part.count(),
    prisma.part.count({ where: { offers: { none: {} } } }),
  ]);
  return { total, withoutOffers };
}
