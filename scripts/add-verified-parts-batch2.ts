/**
 * Segundo lote de peças verificadas manualmente na Amazon.com.br
 * (nomes/modelos conferidos direto na busca da Amazon em 21/07/2026),
 * complementando scripts/add-verified-parts.ts com mais variedade de marcas
 * e faixas de preço. Sem preço/link/imagem — isso fica pra ser associado
 * depois em /admin/pecas.
 *
 * Uso: npx tsx scripts/add-verified-parts-batch2.ts
 */
import { PrismaClient, type PartCategory } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

function toSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true });
}

const PARTS: { category: PartCategory; brand: string; model: string; name: string }[] = [
  // CPU
  { category: "CPU", brand: "Intel", model: "Core i5-14600KF", name: "Intel Core i5-14600KF (BX8071514600KF)" },
  { category: "CPU", brand: "Intel", model: "Core i7-13700F", name: "Intel Core i7-13700F Box" },
  { category: "CPU", brand: "Intel", model: "Core Ultra 5 250K", name: "Intel Core Ultra 5 250K" },
  { category: "CPU", brand: "Intel", model: "Core i9-13900K", name: "Intel Core i9-13900K Box" },
  { category: "CPU", brand: "Intel", model: "Core i5-12400F", name: "Intel Core i5-12400F (BX8071512400F)" },
  { category: "CPU", brand: "Intel", model: "Core i7-12700KF", name: "Intel Core i7-12700KF Box (BX8071512700KF)" },
  { category: "CPU", brand: "Intel", model: "Core i7-14700", name: "Intel Core i7-14700 (BX8071514700)" },
  { category: "CPU", brand: "Intel", model: "Core Ultra 5-245KF", name: "Intel Core Ultra 5-245KF Arrow Lake" },
  { category: "CPU", brand: "Intel", model: "Core i5-10600K", name: "Intel Core i5-10600K Box (BX8070110600K)" },
  { category: "CPU", brand: "Intel", model: "Core i3-13100F", name: "Intel Core i3-13100F" },
  { category: "CPU", brand: "AMD", model: "Ryzen 7 7800X3D", name: "AMD Ryzen 7 7800X3D" },
  { category: "CPU", brand: "AMD", model: "Ryzen 7 5700G", name: "AMD Ryzen 7 5700G Box (100-100000263BOX)" },
  { category: "CPU", brand: "AMD", model: "Ryzen 7 9800X3D", name: "AMD Ryzen 7 9800X3D" },
  { category: "CPU", brand: "AMD", model: "Ryzen 7 8700G", name: "AMD Ryzen 7 8700G Box" },

  // GPU
  { category: "GPU", brand: "Gigabyte", model: "RX 7600 Gaming OC 8GB", name: "Placa de Vídeo Gigabyte RX 7600 Gaming OC 8GB GDDR6 (GV-R76GAMING-OC-8GD)" },
  { category: "GPU", brand: "AMD", model: "Radeon RX 580 8GB", name: "Placa de Vídeo AMD Radeon RX 580 8GB GDDR5" },
  { category: "GPU", brand: "PowerColor", model: "Radeon RX550 4GB", name: "Placa de Vídeo PowerColor AMD Radeon RX550 4GB" },
  { category: "GPU", brand: "ASRock", model: "Radeon RX 6600 Challenger 8GB", name: "ASRock Radeon RX 6600 Challenger 8GB GDDR6" },
  { category: "GPU", brand: "GALAX", model: "RTX 4060 1-Click OC 8GB", name: "Placa de Vídeo GALAX RTX 4060 1-Click OC 8GB GDDR6" },
  { category: "GPU", brand: "MSI", model: "RTX 3050 6GB", name: "Placa de Vídeo MSI GeForce RTX 3050 6GB GDDR6" },

  // RAM
  { category: "RAM", brand: "Corsair", model: "Vengeance DDR5 32GB 6000MHz", name: "Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz CL36 (CMK32GX5M2B6000C36)" },
  { category: "RAM", brand: "Kingston", model: "FURY Beast DDR5 32GB 6000MT/s", name: "Kingston FURY Beast DDR5 32GB 6000MT/s RGB (KF560C36BBEA-32)" },

  // STORAGE
  { category: "STORAGE", brand: "Crucial", model: "P3 1TB NVMe", name: "SSD Crucial P3 1TB NVMe M.2" },
  { category: "STORAGE", brand: "Seagate", model: "BarraCuda 2TB", name: "HD Seagate BarraCuda 2TB 3.5\" SATA III (ST2000DM008)" },

  // PSU
  { category: "PSU", brand: "XPG", model: "Core Reactor II VE 850W", name: "Fonte XPG Core Reactor II VE 850W 80 Plus Gold" },
  { category: "PSU", brand: "Thermaltake", model: "Smart 600W", name: "Fonte Thermaltake Smart 600W 80 Plus White" },

  // MOTHERBOARD
  { category: "MOTHERBOARD", brand: "Gigabyte", model: "B550M AORUS ELITE", name: "Placa-mãe Gigabyte B550M AORUS ELITE (AM4)" },
  { category: "MOTHERBOARD", brand: "MSI", model: "Z890 GAMING PLUS WIFI", name: "Placa-mãe MSI Z890 GAMING PLUS WIFI (LGA1851, DDR5)" },
  { category: "MOTHERBOARD", brand: "Asus", model: "TUF Gaming B650M-E WIFI", name: "Placa-mãe Asus TUF Gaming B650M-E WIFI (AM5, DDR5)" },

  // CASE
  { category: "CASE", brand: "NZXT", model: "H510i Matte Black", name: "Gabinete NZXT H510i Matte Black (CA-H510I-B1)" },
  { category: "CASE", brand: "Redragon", model: "Wideload Pro", name: "Gabinete Redragon Wideload Pro (CA-604B-PRO)" },
  { category: "CASE", brand: "NZXT", model: "H5 Flow Branco", name: "Gabinete NZXT H5 Flow Branco (CC-H52FW-01)" },
  { category: "CASE", brand: "NZXT", model: "H3 Flow Preto", name: "Gabinete NZXT H3 Flow Preto (CC-H31FB-01)" },

  // COOLER
  { category: "COOLER", brand: "Gamdias", model: "Aura GL240", name: "Water Cooler Gamdias Aura GL240 240mm ARGB" },
  { category: "COOLER", brand: "Husky", model: "Glacier 240mm", name: "Water Cooler Husky Glacier 240mm ARGB (HWT600PT)" },

  // MONITOR
  { category: "MONITOR", brand: "LG", model: "22U403A-B", name: "Monitor LG FHD Home & Office 22U403A-B 22\" 120Hz" },
  { category: "MONITOR", brand: "Samsung", model: "Odyssey G5 32\"", name: "Monitor Gamer Samsung Odyssey G5 32\" QHD 165Hz" },
  { category: "MONITOR", brand: "Samsung", model: "Odyssey G5 27\"", name: "Monitor Gamer Samsung Odyssey G5 27\" QHD 165Hz" },

  // PERIPHERAL
  { category: "PERIPHERAL", brand: "HyperX", model: "Cloud Stinger 2 Core", name: "Headset Gamer HyperX Cloud Stinger 2 Core" },
  { category: "PERIPHERAL", brand: "HyperX", model: "Cloud III", name: "Headset Gamer HyperX Cloud III (727A9AA)" },
  { category: "PERIPHERAL", brand: "Razer", model: "DeathAdder Essential", name: "Mouse Gamer Razer DeathAdder Essential" },
  { category: "PERIPHERAL", brand: "HyperX", model: "Alloy Origins 60", name: "Teclado Mecânico HyperX Alloy Origins 60 (HKBO1S-RB-US/G)" },
  { category: "PERIPHERAL", brand: "PCYES", model: "Kuromori 60%", name: "Teclado Gamer Mecânico PCYES Kuromori 60% (PTKM60BL)" },
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
  console.log(`Criadas ${created} peças verificadas (lote 2).`);
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
