import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

function toSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true });
}

function placeholderImage(label: string, bg: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
    <rect width="100%" height="100%" fill="${bg}"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="34" fill="white"
      text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const CATEGORY_TREE: {
  name: string;
  attributes: { key: string; label: string; type: "text" | "number" | "select"; options?: string[] }[];
  children?: { name: string; attributes: typeof CATEGORY_TREE[number]["attributes"] }[];
}[] = [
  {
    name: "Videogames antigos",
    attributes: [
      { key: "console", label: "Console", type: "select", options: ["NES", "SNES", "Mega Drive", "PS1", "PS2", "N64", "Game Boy"] },
      { key: "region", label: "Região", type: "select", options: ["NTSC-U", "NTSC-J", "PAL"] },
      { key: "completo", label: "Completo (caixa e manual)", type: "select", options: ["Sim", "Não"] },
    ],
    children: [
      {
        name: "Consoles",
        attributes: [
          { key: "console", label: "Modelo", type: "text" },
          { key: "acessorios", label: "Acessórios inclusos", type: "text" },
        ],
      },
      {
        name: "Cartuchos e jogos",
        attributes: [
          { key: "console", label: "Console", type: "select", options: ["NES", "SNES", "Mega Drive", "PS1", "PS2", "N64", "Game Boy"] },
          { key: "genero", label: "Gênero", type: "text" },
        ],
      },
    ],
  },
  {
    name: "Cards colecionáveis",
    attributes: [
      { key: "jogo", label: "Jogo", type: "select", options: ["Pokémon", "Magic: The Gathering", "Yu-Gi-Oh!", "Outro"] },
      { key: "raridade", label: "Raridade", type: "text" },
      { key: "gradação", label: "Gradação (PSA/BGS)", type: "text" },
    ],
  },
  {
    name: "Action figures e brinquedos antigos",
    attributes: [
      { key: "franquia", label: "Franquia", type: "text" },
      { key: "fabricante", label: "Fabricante", type: "text" },
      { key: "ano", label: "Ano de fabricação", type: "number" },
    ],
  },
  {
    name: "Quadrinhos e mangás",
    attributes: [
      { key: "editora", label: "Editora", type: "text" },
      { key: "edicao", label: "Edição/Número", type: "text" },
      { key: "idioma", label: "Idioma", type: "select", options: ["Português", "Inglês", "Japonês", "Outro"] },
    ],
  },
  {
    name: "Moedas e cédulas",
    attributes: [
      { key: "pais", label: "País de origem", type: "text" },
      { key: "ano", label: "Ano", type: "number" },
      { key: "material", label: "Material", type: "text" },
    ],
  },
  {
    name: "Vinis, CDs e fitas",
    attributes: [
      { key: "artista", label: "Artista", type: "text" },
      { key: "formato", label: "Formato", type: "select", options: ["Vinil", "CD", "VHS", "DVD", "Fita cassete"] },
      { key: "ano", label: "Ano de lançamento", type: "number" },
    ],
  },
  {
    name: "Miniaturas e diecast",
    attributes: [
      { key: "escala", label: "Escala", type: "text" },
      { key: "marca", label: "Marca", type: "text" },
    ],
  },
];

const DEMO_PASSWORD = "colecionador123";

async function main() {
  console.log("Seeding categories...");
  for (const category of CATEGORY_TREE) {
    const parent = await prisma.category.upsert({
      where: { slug: toSlug(category.name) },
      update: {},
      create: {
        name: category.name,
        slug: toSlug(category.name),
        attributesSchema: category.attributes,
      },
    });

    for (const child of category.children ?? []) {
      const childSlug = toSlug(`${category.name}-${child.name}`);
      await prisma.category.upsert({
        where: { slug: childSlug },
        update: {},
        create: {
          name: child.name,
          slug: childSlug,
          parentId: parent.id,
          attributesSchema: child.attributes,
        },
      });
    }
  }

  console.log("Seeding demo users...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: "admin@reliquiahub.com" },
    update: {},
    create: {
      name: "Admin Relíquia Hub",
      email: "admin@reliquiahub.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  const sellersData = [
    { name: "Retro Games BR", email: "retrogames@reliquiahub.com", storeName: "Retro Games BR", bio: "Especialistas em consoles e cartuchos originais desde 2010.", verified: true },
    { name: "Card Vault", email: "cardvault@reliquiahub.com", storeName: "Card Vault", bio: "Cards raros e gradados de Pokémon, Magic e Yu-Gi-Oh!.", verified: true },
    { name: "Baú de Memórias", email: "bau@reliquiahub.com", storeName: "Baú de Memórias", bio: "Brinquedos, quadrinhos e itens de coleção com história.", verified: false },
  ];

  const sellers = [];
  for (const s of sellersData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        password: passwordHash,
        role: "SELLER",
      },
    });

    const profile = await prisma.sellerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        storeName: s.storeName,
        slug: toSlug(s.storeName),
        bio: s.bio,
        verified: s.verified,
        ratingAvg: s.verified ? 4.8 : 4.2,
        ratingCount: s.verified ? 37 : 8,
        totalSales: s.verified ? 52 : 6,
      },
    });

    sellers.push({ user, profile });
  }

  await prisma.user.upsert({
    where: { email: "comprador@reliquiahub.com" },
    update: {},
    create: {
      name: "Comprador Demo",
      email: "comprador@reliquiahub.com",
      password: passwordHash,
      role: "USER",
    },
  });

  console.log("Seeding demo listings...");
  const categories = await prisma.category.findMany();
  const bySlug = (slug: string) => categories.find((c) => c.slug === slug)!;

  const listingsData = [
    {
      seller: sellers[0],
      category: bySlug(toSlug("Videogames antigos-Cartuchos e jogos")),
      title: "Chrono Trigger original SNES (NTSC-U, completo)",
      description:
        "Cartucho original de Chrono Trigger para Super Nintendo, região NTSC-U. Label em ótimo estado, testado e funcionando perfeitamente. Acompanha manual.",
      price: 1899.9,
      condition: "VERY_GOOD" as const,
      attributes: { console: "SNES", region: "NTSC-U", genero: "RPG" },
      color: "#8a5a2b",
    },
    {
      seller: sellers[0],
      category: bySlug(toSlug("Videogames antigos-Consoles")),
      title: "Console Mega Drive 2 completo na caixa",
      description:
        "Mega Drive 2 com todos os cabos originais, dois controles e caixa em bom estado. Console revisado recentemente.",
      price: 949.0,
      condition: "GOOD" as const,
      attributes: { console: "Mega Drive 2", acessorios: "2 controles, cabo AV, fonte" },
      color: "#2b2b8a",
    },
    {
      seller: sellers[1],
      category: bySlug(toSlug("Cards colecionáveis")),
      title: "Charizard Base Set 1999 PSA 8",
      description:
        "Carta Charizard holo do Base Set de 1999, gradada PSA 8. Uma das cartas mais icônicas do TCG Pokémon.",
      price: 12500.0,
      condition: "LIKE_NEW" as const,
      attributes: { jogo: "Pokémon", raridade: "Holo Rara", "gradação": "PSA 8" },
      color: "#c1893b",
    },
    {
      seller: sellers[1],
      category: bySlug(toSlug("Cards colecionáveis")),
      title: "Black Lotus (reprint autorizado)",
      description:
        "Reprint autorizado de Black Lotus para coleção — não válido para torneios oficiais. Excelente estado de conservação.",
      price: 350.0,
      condition: "NEW" as const,
      attributes: { jogo: "Magic: The Gathering", raridade: "Mítica" },
      color: "#3b3b3b",
    },
    {
      seller: sellers[2],
      category: bySlug(toSlug("Action figures e brinquedos antigos")),
      title: "He-Man Origins - Masters of the Universe (vintage)",
      description:
        "Boneco He-Man vintage dos anos 80, todas as articulações funcionando. Peça de colecionador raríssima.",
      price: 420.0,
      condition: "ACCEPTABLE" as const,
      attributes: { franquia: "Masters of the Universe", fabricante: "Mattel", ano: 1983 },
      color: "#8a2b2b",
    },
    {
      seller: sellers[2],
      category: bySlug(toSlug("Quadrinhos e mangás")),
      title: "Watchmen - Edição Absoluta (capa dura)",
      description:
        "Edição Absoluta de Watchmen em capa dura, com box. Estado de conservação impecável, sem marcas de uso.",
      price: 380.0,
      condition: "LIKE_NEW" as const,
      attributes: { editora: "DC Comics / Panini", edicao: "Absoluta", idioma: "Português" },
      color: "#2b2b2b",
    },
    {
      seller: sellers[0],
      category: bySlug(toSlug("Moedas e cédulas")),
      title: "Cédula de 500 Cruzeiros (1944) - excelente estado",
      description:
        "Cédula histórica brasileira de 500 Cruzeiros emitida em 1944. Papel firme, sem rasgos.",
      price: 275.0,
      condition: "VERY_GOOD" as const,
      attributes: { pais: "Brasil", ano: 1944, material: "Papel-moeda" },
      color: "#2b8a4c",
    },
    {
      seller: sellers[1],
      category: bySlug(toSlug("Vinis, CDs e fitas")),
      title: "Legião Urbana - Dois (LP Vinil Original 1986)",
      description:
        "Vinil original de 1986 do álbum Dois, da Legião Urbana. Capa com leve desgaste, disco em ótimo estado sonoro.",
      price: 320.0,
      condition: "GOOD" as const,
      attributes: { artista: "Legião Urbana", formato: "Vinil", ano: 1986 },
      color: "#5a2b8a",
    },
    {
      seller: sellers[2],
      category: bySlug(toSlug("Miniaturas e diecast")),
      title: "Hot Wheels Redline 1968 - coleção rara",
      description:
        "Miniatura Hot Wheels Redline original de 1968, item raro para colecionadores de diecast vintage.",
      price: 890.0,
      condition: "GOOD" as const,
      attributes: { escala: "1:64", marca: "Hot Wheels" },
      color: "#8a7a2b",
    },
  ];

  for (const item of listingsData) {
    const slug = toSlug(item.title);
    const existing = await prisma.listing.findUnique({ where: { slug } });
    if (existing) continue;

    await prisma.listing.create({
      data: {
        sellerId: item.seller.user.id,
        categoryId: item.category.id,
        title: item.title,
        slug,
        description: item.description,
        condition: item.condition,
        price: item.price,
        status: "ACTIVE",
        attributes: item.attributes,
        images: {
          create: [
            { url: placeholderImage(item.title.slice(0, 24), item.color), order: 0 },
          ],
        },
        priceHistory: { create: { price: item.price } },
      },
    });
  }

  await seedAffiliateAndPcBuilder();

  console.log("Seed finished.");
  console.log("Login de teste:");
  console.log(`  Admin: admin@reliquiahub.com / ${DEMO_PASSWORD}`);
  console.log(`  Vendedor: retrogames@reliquiahub.com / ${DEMO_PASSWORD}`);
  console.log(`  Comprador: comprador@reliquiahub.com / ${DEMO_PASSWORD}`);
}

/**
 * Dados de demonstração do módulo de afiliados + montador de PC. Lojas
 * usam domínios reais de varejistas brasileiros de hardware (para o
 * exemplo fazer sentido), mas as URLs de produto são apenas a home de
 * cada loja — placeholders para o admin substituir por links reais.
 * Nenhum parâmetro de afiliado é inventado.
 */
async function seedAffiliateAndPcBuilder() {
  console.log("Seeding lojas parceiras e peças de PC...");

  const storesData = [
    { name: "KaBuM", domains: ["kabum.com.br", "www.kabum.com.br"], url: "https://www.kabum.com.br" },
    { name: "Pichau", domains: ["pichau.com.br", "www.pichau.com.br"], url: "https://www.pichau.com.br" },
    { name: "Terabyte Shop", domains: ["terabyteshop.com.br", "www.terabyteshop.com.br"], url: "https://www.terabyteshop.com.br" },
  ];

  const stores = [];
  for (const s of storesData) {
    const store = await prisma.store.upsert({
      where: { slug: toSlug(s.name) },
      update: {},
      create: {
        name: s.name,
        slug: toSlug(s.name),
        websiteUrl: s.url,
        allowedDomains: s.domains,
      },
    });
    const existingProgram = await prisma.affiliateProgram.findFirst({
      where: { storeId: store.id },
    });
    if (!existingProgram) {
      await prisma.affiliateProgram.create({
        data: {
          storeId: store.id,
          name: `${s.name} — Afiliados (manual)`,
          providerType: "MANUAL",
          commissionDescription:
            "Percentual definido pela loja — configure ao ativar de verdade.",
        },
      });
    }
    stores.push(store);
  }

  const partsData: {
    category: "CPU" | "GPU" | "RAM" | "STORAGE" | "PSU" | "MOTHERBOARD" | "CASE";
    brand: string;
    model: string;
    name: string;
    specs: Record<string, unknown>;
    prices: { storeIndex: number; price: number; pix: number }[];
  }[] = [
    {
      category: "CPU",
      brand: "AMD",
      model: "Ryzen 5 5500",
      name: "AMD Ryzen 5 5500",
      specs: { socket: "AM4", cores: 6, threads: 12 },
      prices: [
        { storeIndex: 0, price: 649, pix: 599 },
        { storeIndex: 1, price: 669, pix: 619 },
        { storeIndex: 2, price: 639, pix: 609 },
      ],
    },
    {
      category: "GPU",
      brand: "AMD",
      model: "RX 6600",
      name: "AMD Radeon RX 6600 8GB",
      specs: { recommendedPsuWatts: 500, vram: "8GB" },
      prices: [
        { storeIndex: 0, price: 1399, pix: 1299 },
        { storeIndex: 1, price: 1449, pix: 1349 },
      ],
    },
    {
      category: "MOTHERBOARD",
      brand: "ASUS",
      model: "Prime A520M-A",
      name: "Placa-mãe ASUS Prime A520M-A (AM4)",
      specs: { socket: "AM4", memoryType: "DDR4" },
      prices: [
        { storeIndex: 0, price: 549, pix: 509 },
        { storeIndex: 2, price: 559, pix: 519 },
      ],
    },
    {
      category: "RAM",
      brand: "Kingston",
      model: "Fury Beast 16GB (2x8) 3200MHz",
      name: "Memória Kingston Fury Beast 16GB DDR4 3200MHz",
      specs: { memoryType: "DDR4", capacityGb: 16, speedMhz: 3200 },
      prices: [
        { storeIndex: 0, price: 289, pix: 269 },
        { storeIndex: 1, price: 299, pix: 279 },
        { storeIndex: 2, price: 285, pix: 265 },
      ],
    },
    {
      category: "STORAGE",
      brand: "Kingston",
      model: "NV2 1TB NVMe",
      name: "SSD Kingston NV2 1TB NVMe",
      specs: { capacityGb: 1000, interface: "NVMe" },
      prices: [
        { storeIndex: 0, price: 349, pix: 319 },
        { storeIndex: 1, price: 359, pix: 329 },
      ],
    },
    {
      category: "PSU",
      brand: "Corsair",
      model: "CV550",
      name: "Fonte Corsair CV550 550W 80 Plus Bronze",
      specs: { wattage: 550, certification: "80 Plus Bronze" },
      prices: [
        { storeIndex: 0, price: 399, pix: 369 },
        { storeIndex: 2, price: 389, pix: 359 },
      ],
    },
    {
      category: "CASE",
      brand: "Gamemax",
      model: "Spark",
      name: "Gabinete Gamemax Spark Mid Tower",
      specs: { formFactor: "ATX" },
      prices: [
        { storeIndex: 1, price: 219, pix: 199 },
        { storeIndex: 2, price: 229, pix: 209 },
      ],
    },
  ];

  const partsBySlug = new Map<string, { id: string }>();

  for (const p of partsData) {
    const slug = toSlug(p.name);
    const part = await prisma.part.upsert({
      where: { slug },
      update: {},
      create: {
        category: p.category,
        brand: p.brand,
        model: p.model,
        name: p.name,
        slug,
        specs: p.specs as Prisma.InputJsonValue,
      },
    });
    partsBySlug.set(slug, part);

    for (const priceInfo of p.prices) {
      const store = stores[priceInfo.storeIndex];
      const existingOffer = await prisma.offer.findFirst({
        where: { partId: part.id, storeId: store.id },
      });
      if (existingOffer) continue;

      await prisma.offer.create({
        data: {
          partId: part.id,
          storeId: store.id,
          normalPrice: priceInfo.price,
          pixPrice: priceInfo.pix,
          shippingPrice: 0,
          availability: "IN_STOCK",
          condition: "NEW",
          originalUrl: store.websiteUrl ?? "https://example.com",
          affiliateUrl: store.websiteUrl ?? "https://example.com",
          source: "MANUAL",
          status: "ACTIVE",
          priceHistory: {
            create: {
              normalPrice: priceInfo.price,
              pixPrice: priceInfo.pix,
              shippingPrice: 0,
              availability: "IN_STOCK",
            },
          },
        },
      });
    }
  }

  console.log("Seeding jogos e recomendações...");

  const gamesData = [
    {
      name: "Counter-Strike 2",
      description: "FPS competitivo — roda bem mesmo em placas de vídeo de entrada.",
      resolution: "1080p",
      targetFps: 144,
      parts: ["amd-ryzen-5-5500", "amd-radeon-rx-6600-8gb", "memoria-kingston-fury-beast-16gb-ddr4-3200mhz"],
    },
    {
      name: "Cyberpunk 2077",
      description: "RPG de mundo aberto exigente — recomenda-se GPU dedicada de médio porte.",
      resolution: "1080p",
      targetFps: 60,
      parts: ["amd-ryzen-5-5500", "amd-radeon-rx-6600-8gb", "ssd-kingston-nv2-1tb-nvme"],
    },
  ];

  for (const g of gamesData) {
    const slug = toSlug(g.name);
    const game = await prisma.game.upsert({
      where: { slug },
      update: {},
      create: { name: g.name, slug, description: g.description },
    });

    for (const partSlug of g.parts) {
      const part = partsBySlug.get(partSlug);
      if (!part) continue;
      const existing = await prisma.gameRecommendedPart.findFirst({
        where: { gameId: game.id, partId: part.id },
      });
      if (existing) continue;
      await prisma.gameRecommendedPart.create({
        data: {
          gameId: game.id,
          partId: part.id,
          resolution: g.resolution,
          targetFps: g.targetFps,
        },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
