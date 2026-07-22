/**
 * Cadastra um catálogo pequeno de peças verificadas manualmente na Amazon.com.br
 * (título/marca conferidos direto na busca da Amazon em 21/07/2026), pra
 * substituir a importação em massa do BuildCores (removida por
 * scripts/remove-unlinked-parts.ts). Sem preço/link/imagem — isso fica pra
 * ser associado depois em /admin/pecas.
 *
 * Uso: npx tsx scripts/add-verified-parts.ts
 */
import { PrismaClient, type PartCategory } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

function toSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true });
}

const PARTS: { category: PartCategory; brand: string; model: string; name: string }[] = [
  { category: "CPU", brand: "AMD", model: "Ryzen 5 5500", name: "AMD Ryzen 5 5500 (100-100000457BOX)" },
  { category: "CPU", brand: "AMD", model: "Ryzen 5 5600GT", name: "AMD Ryzen 5 5600GT (AM4, 6 núcleos, Radeon integrada)" },
  { category: "CPU", brand: "AMD", model: "Ryzen 5 8500G", name: "AMD Ryzen 5 8500G Box (AM5, Radeon 740M integrada)" },

  { category: "GPU", brand: "Asus", model: "TUF RTX 5070 OC 12GB", name: "Asus TUF Gaming GeForce RTX 5070 OC 12GB GDDR7" },
  { category: "GPU", brand: "MSI", model: "RTX 5080 Inspire 3X OC 16GB", name: "MSI GeForce RTX 5080 16G Inspire 3X OC GDDR7" },

  { category: "RAM", brand: "Corsair", model: "Vengeance LPX 16GB DDR4 3200MHz", name: "Corsair Vengeance LPX 16GB DDR4 3200MHz (CMK16GX4M1E3200C16)" },
  { category: "RAM", brand: "Kingston", model: "FURY Beast 16GB DDR4 3200MHz", name: "Kingston FURY Beast 16GB DDR4 3200MHz (KF432C16BB/16)" },
  { category: "RAM", brand: "XPG", model: "Gammix D35 16GB DDR4 3200MHz", name: "XPG Gammix D35 16GB DDR4 3200MHz" },

  { category: "STORAGE", brand: "Kingston", model: "NV3 1TB NVMe", name: "SSD Kingston NV3 1TB M.2 NVMe Gen4 (SNV3S/1000G)" },
  { category: "STORAGE", brand: "Samsung", model: "990 PRO 1TB NVMe", name: "SSD Samsung 990 PRO 1TB NVMe M.2" },
  { category: "STORAGE", brand: "Western Digital", model: "WD SN3000 1TB NVMe", name: "SSD WD Green SN3000 1TB NVMe (WDS100T4G0E)" },

  { category: "PSU", brand: "Corsair", model: "CX650 650W", name: "Fonte Corsair CX650 650W 80 Plus Bronze" },

  { category: "MOTHERBOARD", brand: "Asus", model: "Prime B660M-A AC D4", name: "Placa-mãe Asus Prime B660M-A AC D4 (LGA1700)" },

  { category: "CASE", brand: "Cooler Master", model: "MasterBox Q300L V2", name: "Gabinete Cooler Master MasterBox Q300L V2 (vidro temperado)" },

  { category: "COOLER", brand: "Cooler Master", model: "Hyper 212 Spectrum V3", name: "Cooler Master Hyper 212 Spectrum V3 (ARGB)" },

  { category: "MONITOR", brand: "Acer", model: "Nitro KG273 27\" 120Hz", name: "Monitor Gamer Acer Nitro KG273 27\" IPS Full HD 120Hz" },
  { category: "MONITOR", brand: "Acer", model: "Nitro KG270 27\" 144Hz", name: "Monitor Gamer Acer Nitro KG270 P0bi 27\" Full HD 144Hz" },

  { category: "PERIPHERAL", brand: "Logitech", model: "G203", name: "Mouse Gamer Logitech G203" },
  { category: "PERIPHERAL", brand: "Redragon", model: "Kumara K552", name: "Teclado Mecânico Redragon Kumara K552" },
];

async function main() {
  let created = 0;
  for (const part of PARTS) {
    const slug = await uniqueSlug(part.name, async (candidate) =>
      Boolean(await prisma.part.findUnique({ where: { slug: candidate } }))
    );
    await prisma.part.create({ data: { ...part, slug } });
    created++;
  }
  console.log(`Criadas ${created} peças verificadas.`);
}

async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>) {
  const root = toSlug(base) || "item";
  let candidate = root;
  let attempt = 0;
  while (await exists(candidate)) {
    attempt += 1;
    candidate = `${root}-${Math.random().toString(36).slice(2, 6)}${attempt > 3 ? attempt : ""}`;
  }
  return candidate;
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
