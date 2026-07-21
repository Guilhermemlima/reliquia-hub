export const OFFER_CSV_HEADERS = [
  // deixe em branco para tentar associação automática por ean/mpn/marca+modelo
  "part_slug",
  // usado como referência humana e para associação aproximada quando
  // part_slug estiver em branco
  "part_title",
  // CPU, GPU, RAM, STORAGE, PSU, MOTHERBOARD, CASE, COOLER ou MONITOR —
  // só é obrigatório quando a peça não existe ainda no catálogo (nesse
  // caso o sistema cria a peça automaticamente com esses dados)
  "part_category",
  "ean",
  "mpn",
  "part_brand",
  "part_model",
  "store_slug",
  "seller_name",
  "price",
  "pix_price",
  "shipping_price",
  "condition",
  "availability",
  "original_url",
  "affiliate_url",
] as const;

export type OfferCsvRow = Record<(typeof OFFER_CSV_HEADERS)[number], string>;

/**
 * Parser de CSV simples (suporta campos entre aspas com vírgula/quebra de
 * linha dentro). Não depende de nenhuma lib externa.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      pushField();
    } else if (char === "\n") {
      pushRow();
    } else if (char === "\r") {
      // ignore, \n handles the row break
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) pushRow();

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export function csvRowsToOfferRows(rows: string[][]): {
  rows: OfferCsvRow[];
  error?: string;
} {
  if (rows.length === 0) return { rows: [], error: "Arquivo vazio." };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const missing = OFFER_CSV_HEADERS.filter((h) => !header.includes(h));
  if (missing.length > 0) {
    return {
      rows: [],
      error: `Colunas ausentes no cabeçalho: ${missing.join(", ")}.`,
    };
  }

  const dataRows = rows.slice(1).map((r) => {
    const obj = {} as OfferCsvRow;
    for (const key of OFFER_CSV_HEADERS) {
      const index = header.indexOf(key);
      obj[key] = (r[index] ?? "").trim();
    }
    return obj;
  });

  return { rows: dataRows };
}

export function offerCsvTemplate(): string {
  const exactMatch = [
    "cpu-amd-ryzen-5-5500",
    "",
    "",
    "",
    "",
    "",
    "",
    "kabum",
    "KaBuM",
    "649.00",
    "599.00",
    "0",
    "NEW",
    "IN_STOCK",
    "https://www.kabum.com.br/produto/exemplo",
    "",
  ];
  const autoMatch = [
    "",
    "Placa de vídeo RX 6600 8GB",
    "",
    "",
    "",
    "AMD",
    "RX 6600",
    "pichau",
    "Pichau",
    "1399.00",
    "1299.00",
    "0",
    "NEW",
    "IN_STOCK",
    "https://www.pichau.com.br/produto/exemplo",
    "",
  ];
  const newPart = [
    "",
    "Teclado Mecânico Redragon Kumara",
    "PERIPHERAL",
    "",
    "",
    "Redragon",
    "Kumara K552",
    "terabyte-shop",
    "Terabyte Shop",
    "229.00",
    "209.00",
    "0",
    "NEW",
    "IN_STOCK",
    "https://www.terabyteshop.com.br/produto/exemplo",
    "",
  ];
  return [
    OFFER_CSV_HEADERS.join(","),
    exactMatch.join(","),
    autoMatch.join(","),
    newPart.join(","),
  ].join("\n");
}
