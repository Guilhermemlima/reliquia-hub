/**
 * Terceiro lote de peças verificadas manualmente na Amazon.com.br
 * (nomes/modelos conferidos direto na busca da Amazon em 22/07/2026),
 * pra levar o catálogo além de 200 itens verificados. Sem preço/link/
 * imagem — isso fica pra ser associado depois em /admin/pecas.
 *
 * Uso: npx tsx scripts/add-verified-parts-batch3.ts
 */
import { PrismaClient, type PartCategory } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

function toSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true });
}

const PARTS: { category: PartCategory; brand: string; model: string; name: string }[] = [
  // CPU — Ryzen 9 e Core i9 / Ultra 9
  { category: "CPU", brand: "AMD", model: "Ryzen 9 7900X", name: "AMD Ryzen 9 7900X Box" },
  { category: "CPU", brand: "AMD", model: "Ryzen 9 7950X", name: "AMD Ryzen 9 7950X Box" },
  { category: "CPU", brand: "AMD", model: "Ryzen 9 9950X3D", name: "AMD Ryzen 9 9950X3D" },
  { category: "CPU", brand: "AMD", model: "Ryzen 9 9950X", name: "AMD Ryzen 9 9950X Box" },
  { category: "CPU", brand: "AMD", model: "Ryzen 9 9900X3D", name: "AMD Ryzen 9 9900X3D" },
  { category: "CPU", brand: "AMD", model: "Ryzen 9 5900XT", name: "AMD Ryzen 9 5900XT Box" },
  { category: "CPU", brand: "AMD", model: "Ryzen 9 7900", name: "AMD Ryzen 9 7900 Box" },
  { category: "CPU", brand: "AMD", model: "Ryzen 9 3900X", name: "AMD Ryzen 9 3900X Box" },
  { category: "CPU", brand: "AMD", model: "Ryzen 9 5950X", name: "AMD Ryzen 9 5950X" },
  { category: "CPU", brand: "Intel", model: "Core i9-12900F", name: "Intel Core i9-12900F Box" },
  { category: "CPU", brand: "Intel", model: "Core i9-14900KF", name: "Intel Core i9-14900KF (BX8071514900KF)" },
  { category: "CPU", brand: "Intel", model: "Core i9-12900KF", name: "Intel Core i9-12900KF Box (BX8071512900KF)" },
  { category: "CPU", brand: "Intel", model: "Core i9-14900K", name: "Intel Core i9-14900K (BX8071514900K)" },
  { category: "CPU", brand: "Intel", model: "Core Ultra 9 285K", name: "Intel Core Ultra 9 285K" },
  { category: "CPU", brand: "Intel", model: "Core i9-12900K", name: "Intel Core i9-12900K (BX8071512900K)" },
  { category: "CPU", brand: "Intel", model: "Core i9-12900", name: "Intel Core i9-12900 Box" },
  { category: "CPU", brand: "Intel", model: "Core i9-9900K", name: "Intel Core i9-9900K (9ª geração)" },
  { category: "CPU", brand: "Intel", model: "Core i9-10900F", name: "Intel Core i9-10900F Box (BX8070110900F)" },
  { category: "CPU", brand: "Intel", model: "Core i9-14900KS", name: "Intel Core i9-14900KS" },

  // GPU
  { category: "GPU", brand: "MSI", model: "RTX 3050 LP 6G OC", name: "MSI GeForce RTX 3050 LP 6G OC (perfil baixo)" },
  { category: "GPU", brand: "MSI", model: "RTX 5060 Shadow 2X OC 8GB", name: "Placa de Vídeo MSI RTX 5060 Shadow 2X OC 8GB GDDR7" },
  { category: "GPU", brand: "MSI", model: "RTX 5060 Ventus 2X OC 8GB", name: "MSI GeForce RTX 5060 Ventus 2X OC 8GB GDDR7" },
  { category: "GPU", brand: "GALAX", model: "RTX 5060 1-Click OC V2 8GB", name: "Placa de Vídeo GALAX GeForce RTX 5060 1-Click OC V2 8GB GDDR7" },
  { category: "GPU", brand: "MSI", model: "RTX 5050 Shadow 2X OC 8GB", name: "Placa de Vídeo MSI GeForce RTX 5050 Shadow 2X OC 8GB GDDR6" },
  { category: "GPU", brand: "PCYES", model: "RTX 3050 8GB Edge", name: "PCYES GPU RTX 3050 8GB GDDR6 128Bit Projeto Edge" },
  { category: "GPU", brand: "PCYES", model: "RTX 3060 12GB Graffiti", name: "PCYES GPU RTX 3060 12GB GDDR6 192Bit Graffiti Projeto Edge" },
  { category: "GPU", brand: "GALAX", model: "RTX 5070 2X 1-Click OC 12GB", name: "Placa de Vídeo GALAX RTX 5070 2X 1-Click OC 12GB GDDR7" },
  { category: "GPU", brand: "Inno3D", model: "RTX 3060 Twin X2 12GB", name: "Placa de Vídeo Inno3D GeForce RTX 3060 Twin X2 12GB GDDR6" },
  { category: "GPU", brand: "Palit", model: "RTX 3060 Dual 12GB", name: "Placa de Vídeo Palit GeForce RTX 3060 Dual 12GB GDDR6" },
  { category: "GPU", brand: "MSI", model: "RTX 3060 12GB Ventus", name: "MSI GeForce RTX 3060 12GB Ventus Twin Fan" },
  { category: "GPU", brand: "Palit", model: "RTX 3060 Ti Dual 8GB", name: "Placa de Vídeo Palit GeForce RTX 3060 Ti Dual 8GB GDDR6" },
  { category: "GPU", brand: "Gigabyte", model: "RTX 5060 Ti WINDFORCE 8GB", name: "Gigabyte GeForce RTX 5060 Ti WINDFORCE 8GB GDDR7" },
  { category: "GPU", brand: "MSI", model: "RTX 5060 Ti Ventus 2X OC Plus 8GB", name: "Placa de Vídeo MSI RTX 5060 Ti Ventus 2X OC Plus 8GB GDDR7" },
  { category: "GPU", brand: "Gigabyte", model: "Radeon RX 6700 XT Gaming OC 12GB", name: "Gigabyte Radeon RX 6700 XT Gaming OC 12GB GDDR6" },
  { category: "GPU", brand: "Asus", model: "TUF Radeon RX 6700 XT OC 12GB", name: "Asus TUF Gaming Radeon RX 6700 XT OC 12GB GDDR6" },
  { category: "GPU", brand: "Asus", model: "DUAL Radeon RX 7600 EVO OC 8GB", name: "Asus Dual Radeon RX 7600 EVO OC Edition 8GB GDDR6" },
  { category: "GPU", brand: "ASRock", model: "Radeon RX 5700 XT 8GB", name: "Placa de Vídeo Radeon RX 5700 XT 8GB GDDR6" },

  // RAM
  { category: "RAM", brand: "Corsair", model: "Dominator Platinum RGB DDR5 32GB 6000MHz", name: "Corsair Dominator Platinum RGB DDR5 32GB (2x16GB) 6000MHz (CMT32GX5M2E6000C36)" },
  { category: "RAM", brand: "Corsair", model: "Dominator Titanium RGB DDR5 32GB 6600MHz", name: "Corsair Dominator Titanium RGB DDR5 32GB (2x16GB) 6600MHz (CMP32GX5M2X6600C32)" },
  { category: "RAM", brand: "Corsair", model: "Vengeance LPX 16GB (2x8GB) DDR4 3200MHz", name: "Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz (CMK16GX4M2B3200C16)" },
  { category: "RAM", brand: "Corsair", model: "Vengeance LPX 8GB DDR4 2666MHz", name: "Corsair Vengeance LPX 8GB DDR4 2666MHz (CMK8GX4M1A2666C16)" },
  { category: "RAM", brand: "Corsair", model: "Vengeance LPX 32GB (2x16GB) DDR4 2666MHz", name: "Corsair Vengeance LPX 32GB (2x16GB) DDR4 2666MHz (CMK32GX4M2A2666C16)" },
  { category: "RAM", brand: "Kingston", model: "FURY Beast Black 16GB (2x8GB) DDR4 3200MHz", name: "Kingston FURY Beast Black 16GB (2x8GB) DDR4 3200MHz (KF432C16BBK2/16)" },
  { category: "RAM", brand: "XPG", model: "Gammix D35 8GB DDR4 3200MHz", name: "Memória XPG Gammix D35 8GB DDR4 3200MHz" },
  { category: "RAM", brand: "XPG", model: "Spectrix D35G RGB 8GB DDR4 3200MHz", name: "Memória XPG Spectrix D35G RGB 8GB DDR4 3200MHz" },
  { category: "RAM", brand: "Kingston", model: "FURY Beast 8GB DDR4 3200MHz", name: "Memória Kingston FURY Beast 8GB DDR4 3200MHz (KF432C16BB/8)" },

  // STORAGE
  { category: "STORAGE", brand: "Kingston", model: "A400 480GB SATA", name: "SSD Kingston A400 480GB SATA (SA400S37/480G)" },
  { category: "STORAGE", brand: "Kingston", model: "A400 240GB SATA", name: "SSD Kingston A400 240GB SATA (SA400S37/240G)" },
  { category: "STORAGE", brand: "SanDisk", model: "SSD Plus 480GB", name: "SSD SanDisk Plus 480GB SATA (SDSSDA-480G-G26)" },
  { category: "STORAGE", brand: "Kingston", model: "A400 960GB SATA", name: "SSD Kingston A400 960GB SATA (SA400S37/960G)" },
  { category: "STORAGE", brand: "SanDisk", model: "SSD Plus 500GB", name: "SSD SanDisk Plus 500GB SATA (SDSSDA-500G-G28)" },
  { category: "STORAGE", brand: "Kingston", model: "UV500 480GB mSATA", name: "SSD Kingston UV500 480GB mSATA (SUV500MS/480G)" },
  { category: "STORAGE", brand: "ADATA", model: "SU650 240GB", name: "SSD ADATA SU650 240GB SATA" },
  { category: "STORAGE", brand: "Seagate", model: "BarraCuda 1TB Interno", name: "HD Seagate BarraCuda 1TB Interno 3.5\" SATA3 (ST1000DM010)" },
  { category: "STORAGE", brand: "Seagate", model: "HD 1TB ST1000VM002", name: "HD Seagate 1TB para Desktop 3.5\" SATA3 (ST1000VM002)" },
  { category: "STORAGE", brand: "Seagate", model: "SkyHawk Surveillance 1TB", name: "HD Seagate SkyHawk Surveillance 1TB SATA 3.5\"" },
  { category: "STORAGE", brand: "Western Digital", model: "WD Blue SN5100 1TB NVMe", name: "SSD WD Blue SN5100 1TB NVMe (WDS100T5B0E)" },
  { category: "STORAGE", brand: "Western Digital", model: "WD Green 1TB SATA", name: "SSD WD Green 1TB SATA 2.5\"" },
  { category: "STORAGE", brand: "Western Digital", model: "WD Blue 1TB HDD", name: "HD WD Blue 1TB 5400RPM SATA 2.5\" (WD10SPZX)" },
  { category: "STORAGE", brand: "Western Digital", model: "WD Blue SN5000 1TB NVMe", name: "SSD WD Blue SN5000 1TB NVMe (WDS100T4B0E)" },
  { category: "STORAGE", brand: "Western Digital", model: "WD SA510 1TB SATA", name: "SSD WD SA510 1TB SATA (WDS100T3B0A)" },

  // PSU
  { category: "PSU", brand: "Gamemax", model: "GS600 600W", name: "Fonte Gamemax GS600 600W 80 Plus White" },
  { category: "PSU", brand: "Fortrek", model: "Black Hawk 500W", name: "Fonte Fortrek Black Hawk 500W 80 Plus Bronze" },
  { category: "PSU", brand: "Fortrek", model: "Crusader 500W", name: "Fonte Gamer Fortrek Crusader ATX 500W" },
  { category: "PSU", brand: "Gamemax", model: "GP750 750W", name: "Fonte Gamemax GP750 750W 80 Plus Bronze" },
  { category: "PSU", brand: "Gamemax", model: "GP650 650W", name: "Fonte Gamemax GP650 650W 80 Plus Bronze" },
  { category: "PSU", brand: "Aerocool", model: "KCAS 500W", name: "Fonte Aerocool KCAS 500W 80 Plus Bronze" },
  { category: "PSU", brand: "Duex", model: "DX 500FSE+", name: "Fonte Duex DX 500FSE+ 500W 80 Plus Bronze" },

  // MOTHERBOARD
  { category: "MOTHERBOARD", brand: "Asus", model: "Prime H610M-CS D4", name: "Placa-mãe Asus Prime H610M-CS D4 (LGA1700)" },
  { category: "MOTHERBOARD", brand: "Gigabyte", model: "A520M K V2", name: "Placa-mãe Gigabyte A520M K V2 (AM4)" },
  { category: "MOTHERBOARD", brand: "Gigabyte", model: "A520M DS3H V2", name: "Placa-mãe Gigabyte A520M DS3H V2 (AM4)" },
  { category: "MOTHERBOARD", brand: "Asus", model: "PRIME A520M-R", name: "Placa-mãe Asus PRIME A520M-R (AM4)" },
  { category: "MOTHERBOARD", brand: "MSI", model: "A520M-A PRO", name: "Placa-mãe MSI A520M-A PRO (AM4)" },

  // CASE
  { category: "CASE", brand: "Redragon", model: "Wideload Mini Lite RGB", name: "Gabinete Redragon Wideload Mini Lite RGB (CA-611B)" },
  { category: "CASE", brand: "Redragon", model: "Wideload Pro Branco", name: "Gabinete Redragon Wideload Pro Branco (CA-604W-PRO)" },
  { category: "CASE", brand: "Redragon", model: "Geometric Future Model 5", name: "Gabinete Redragon Geometric Future Model 5 (GEO-M5-RD)" },
  { category: "CASE", brand: "Redragon", model: "Eternal", name: "Gabinete Redragon Eternal (CA-612BR)" },
  { category: "CASE", brand: "Lian Li", model: "Lancool 217 Infinity Preto", name: "Gabinete Lian Li Lancool 217 Infinity Preto (LAN217INFX)" },
  { category: "CASE", brand: "Lian Li", model: "Lancool 207 Branco", name: "Gabinete Lian Li Lancool 207 Branco" },
  { category: "CASE", brand: "Lian Li", model: "Lancool 217 Branco", name: "Gabinete Lian Li Lancool 217 Branco (LAN217W)" },
  { category: "CASE", brand: "Lian Li", model: "Lancool 216X", name: "Gabinete Lian Li Lancool 216X" },
  { category: "CASE", brand: "Lian Li", model: "Lancool 217 Infinity Branco", name: "Gabinete Lian Li Lancool 217 Infinity Branco (LAN217INFW)" },
  { category: "CASE", brand: "Lian Li", model: "Lancool 206 Branco", name: "Gabinete Lian Li Lancool 206 Branco" },

  // COOLER
  { category: "COOLER", brand: "Gamdias", model: "Boreas E1-410 Mono", name: "Cooler Gamdias Boreas E1-410 Mono" },
  { category: "COOLER", brand: "Gamdias", model: "Boreas E1-410 LED Azul", name: "Cooler Gamdias Boreas E1-410 LED Azul" },
  { category: "COOLER", brand: "Thermalright", model: "Peerless Assassin 120 SE", name: "Cooler Thermalright Peerless Assassin 120 SE (torre dupla)" },
  { category: "COOLER", brand: "Rise Mode", model: "Storm 8 Black", name: "Air Cooler Rise Mode Storm 8 Black" },
  { category: "COOLER", brand: "Redragon", model: "Tyr", name: "Cooler Redragon Tyr LED Azul (CC-9104B)" },

  // MONITOR
  { category: "MONITOR", brand: "Acer", model: "CB242Y Gbipr 23.8\"", name: "Monitor Acer CB242Y Gbipr 23.8\" IPS 120Hz" },
  { category: "MONITOR", brand: "Acer", model: "EK271 Ebi 27\"", name: "Monitor Acer EK271 Ebi 27\" Full HD IPS 100Hz FreeSync" },
  { category: "MONITOR", brand: "Acer", model: "E200Q BI 19.5\"", name: "Monitor Acer E200Q BI 19.5\" HD 75Hz" },
  { category: "MONITOR", brand: "AOC", model: "24B35HM2 24\"", name: "Monitor Gamer AOC 24\" Full HD 100Hz (24B35HM2)" },
  { category: "MONITOR", brand: "AOC", model: "AGON G50 24\"", name: "Monitor Gamer AOC AGON G50 24\" 144Hz G-SYNC (24G50F)" },
  { category: "MONITOR", brand: "AOC", model: "AGON G42 24\"", name: "Monitor Gamer AOC AGON G42 24\" 200Hz NVIDIA G-Sync (24G42HE)" },

  // PERIPHERAL
  { category: "PERIPHERAL", brand: "Redragon", model: "Cerberus B703", name: "Mouse Redragon Cerberus B703" },
  { category: "PERIPHERAL", brand: "Razer", model: "Ornata V3 X", name: "Teclado Razer Ornata V3 X (RZ03-04470200R3U)" },
  { category: "PERIPHERAL", brand: "Razer", model: "Ornata V3 Low Profile", name: "Teclado Razer Ornata V3 Low Profile (RZ03-04460200R3U)" },
  { category: "PERIPHERAL", brand: "Razer", model: "BlackWidow V4 X", name: "Teclado Razer BlackWidow V4 X (Green Switch)" },
  { category: "PERIPHERAL", brand: "Razer", model: "Huntsman Mini", name: "Teclado Mecânico Razer Huntsman Mini 60% Optical Switch" },
  { category: "PERIPHERAL", brand: "Razer", model: "Huntsman V3 Pro Mini", name: "Teclado Razer Huntsman V3 Pro Mini" },
  { category: "PERIPHERAL", brand: "Razer", model: "Huntsman V3", name: "Teclado Gamer Razer Huntsman V3" },
  { category: "PERIPHERAL", brand: "Alienware", model: "AW520H", name: "Headset Gamer Alienware AW520H com Fio" },
  { category: "PERIPHERAL", brand: "Logitech", model: "Zone Wireless Plus", name: "Headset Logitech Zone Wireless Plus" },
  { category: "PERIPHERAL", brand: "Logitech", model: "C920s", name: "Webcam Logitech C920s Full HD 1080p" },
  { category: "PERIPHERAL", brand: "Logitech", model: "C920", name: "Webcam Logitech C920 Full HD 1080p (960-000764)" },
  { category: "PERIPHERAL", brand: "Logitech", model: "C920e", name: "Webcam Logitech C920e HD 1080p" },
];

async function main() {
  let created = 0;
  for (const part of PARTS) {
    const existing = await prisma.part.findFirst({ where: { name: part.name } });
    if (existing) {
      console.log(`Já existe, pulando: ${part.name}`);
      continue;
    }
    const slug = await uniqueSlug(part.name, async (candidate) =>
      Boolean(await prisma.part.findUnique({ where: { slug: candidate } }))
    );
    await prisma.part.create({ data: { ...part, slug } });
    created++;
  }
  console.log(`Criadas ${created} peças verificadas (lote 3).`);
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
