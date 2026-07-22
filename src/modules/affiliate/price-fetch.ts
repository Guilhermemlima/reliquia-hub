/**
 * Busca o preço atual de uma oferta na própria página pública do produto —
 * melhor esforço, sem nenhuma API oficial (nenhuma loja/o Amazon Associates
 * ainda não está liberado pra API real, ver docs/affiliate-providers.md).
 *
 * Só lê dados estruturados que a própria página expõe publicamente pra
 * ferramentas automáticas (JSON-LD schema.org/Product, meta tags de preço
 * usadas por rastreadores de rede social/anúncio) — não simula clique,
 * login nem navegação, e falha silenciosamente (retorna null) quando a loja
 * bloqueia ou não expõe esse dado. Lojas com proteção anti-bot forte (ex:
 * Amazon sem API) vão falhar com frequência — isso é esperado, não é um bug.
 */
export type PriceHint = { price: number };

const FETCH_TIMEOUT_MS = 5000;
const MAX_BYTES = 300_000;

export async function fetchPriceHint(url: string): Promise<PriceHint | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);

    if (!res.ok || !res.body) return null;

    const html = await readLimited(res.body, MAX_BYTES);
    const price = extractPrice(html);
    return price ? { price } : null;
  } catch {
    return null;
  }
}

async function readLimited(body: ReadableStream<Uint8Array>, maxBytes: number) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let html = "";
  let received = 0;
  try {
    while (received < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      received += value.byteLength;
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  return html;
}

function extractPrice(html: string): number | undefined {
  // schema.org JSON-LD: "price":"1234.56" ou "price": 1234.56
  const jsonLd = html.match(/"price"\s*:\s*"?(\d+(?:\.\d{1,2})?)"?/i);
  if (jsonLd) {
    const value = Number(jsonLd[1]);
    if (isFinite(value) && value > 0) return value;
  }

  // meta itemprop="price" content="1234.56"
  const metaItemprop = html.match(
    /<meta[^>]+itemprop=["']price["'][^>]+content=["'](\d+(?:\.\d{1,2})?)["']/i
  );
  if (metaItemprop) {
    const value = Number(metaItemprop[1]);
    if (isFinite(value) && value > 0) return value;
  }

  // meta property="product:price:amount" content="1234.56"
  const metaProduct = html.match(
    /<meta[^>]+property=["']product:price:amount["'][^>]+content=["'](\d+(?:\.\d{1,2})?)["']/i
  );
  if (metaProduct) {
    const value = Number(metaProduct[1]);
    if (isFinite(value) && value > 0) return value;
  }

  return undefined;
}
