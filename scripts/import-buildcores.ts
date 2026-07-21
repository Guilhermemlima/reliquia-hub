/**
 * Importa peças do catálogo BuildCores OpenDB (https://github.com/buildcores/buildcores-open-db)
 * pra dentro da tabela Part, como ponto de partida pro catálogo do montador.
 *
 * Licença dos dados: ODC-By (atribuição obrigatória) — ver docs/affiliate-compliance.md.
 * O BuildCores não tem preço, imagem nem EAN — essas peças entram sem oferta/imagem,
 * pra serem associadas manualmente depois em /admin/pecas.
 *
 * Uso: npx tsx scripts/import-buildcores.ts
 */
import { PrismaClient, Prisma, type PartCategory } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

const REPO = "buildcores/buildcores-open-db";
const BRANCH = "main";
const PER_CATEGORY_LIMIT = 200;
const CONCURRENCY = 12;

// Pasta no repo -> nossa PartCategory. Categorias fora dessa lista (Laptop, Chair,
// Desk, OS, PrebuiltDesktop, ThermalCompound, VRHeadset, etc.) não são peças de PC
// montável e ficam de fora.
const CATEGORY_MAP: Record<string, PartCategory> = {
  CPU: "CPU",
  GPU: "GPU",
  RAM: "RAM",
  Storage: "STORAGE",
  PSU: "PSU",
  Motherboard: "MOTHERBOARD",
  PCCase: "CASE",
  CPUCooler: "COOLER",
  Monitor: "MONITOR",
  Keyboard: "PERIPHERAL",
  Mouse: "PERIPHERAL",
  Headphones: "PERIPHERAL",
};

function toSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true });
}

type BuildCoresItem = {
  opendb_id: string;
  metadata: {
    name: string;
    manufacturer?: string;
    part_numbers?: string[];
  };
  [key: string]: unknown;
};

async function listFiles(folder: string): Promise<string[]> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/open-db/${folder}`,
    { headers: { Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) throw new Error(`Falha ao listar ${folder}: ${res.status}`);
  const entries = (await res.json()) as { name: string }[];
  return entries
    .map((e) => e.name)
    .filter((n) => n.endsWith(".json"))
    .sort()
    .slice(0, PER_CATEGORY_LIMIT);
}

async function fetchItem(folder: string, file: string): Promise<BuildCoresItem | null> {
  const res = await fetch(
    `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/open-db/${folder}/${file}`
  );
  if (!res.ok) return null;
  try {
    return (await res.json()) as BuildCoresItem;
  } catch {
    return null;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

async function main() {
  const existingSlugs = new Set(
    (await prisma.part.findMany({ select: { slug: true } })).map((p) => p.slug)
  );

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const [folder, category] of Object.entries(CATEGORY_MAP)) {
    console.log(`\n== ${folder} -> ${category} ==`);
    const files = await listFiles(folder);
    console.log(`  ${files.length} arquivos (limite ${PER_CATEGORY_LIMIT})`);

    const items = await mapWithConcurrency(files, CONCURRENCY, (file) =>
      fetchItem(folder, file)
    );

    const toCreate: {
      category: PartCategory;
      brand: string;
      model: string;
      name: string;
      slug: string;
      mpn?: string;
      specs: Prisma.InputJsonValue;
    }[] = [];

    for (const item of items) {
      if (!item?.metadata?.name) {
        totalSkipped++;
        continue;
      }
      const name = item.metadata.name.trim();
      const brand = item.metadata.manufacturer?.trim() || "Genérico";
      const mpn = item.metadata.part_numbers?.[0];

      let slug = toSlug(name) || toSlug(`${brand}-${item.opendb_id}`);
      if (existingSlugs.has(slug)) {
        slug = `${slug}-${item.opendb_id.slice(0, 6)}`;
      }
      if (existingSlugs.has(slug)) {
        totalSkipped++;
        continue;
      }
      existingSlugs.add(slug);

      const { metadata: _metadata, opendb_id: _id, ...specs } = item;
      void _metadata;
      void _id;

      toCreate.push({
        category,
        brand,
        model: name,
        name,
        slug,
        mpn,
        specs: specs as Prisma.InputJsonValue,
      });
    }

    if (toCreate.length > 0) {
      await prisma.part.createMany({ data: toCreate });
    }
    totalCreated += toCreate.length;
    console.log(`  criadas: ${toCreate.length}`);
  }

  console.log(`\nTotal criado: ${totalCreated} | ignorado (sem nome/duplicado): ${totalSkipped}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
