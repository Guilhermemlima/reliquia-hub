/**
 * Busca apenas a prévia pública de um link (título e imagem via meta tags
 * Open Graph / Twitter Card) — a mesma informação que WhatsApp/Slack usam
 * pra gerar preview quando alguém cola um link. Não extrai preço, estoque
 * nem qualquer outro dado comercial — isso continua proibido (ver
 * docs/affiliate-compliance.md, seção "proibições"). Best-effort: se a
 * loja bloquear a requisição, retorna null e o fluxo chamador segue sem
 * imagem/título automáticos.
 */
export type LinkPreview = { title?: string; image?: string };

const FETCH_TIMEOUT_MS = 6000;
const MAX_BYTES = 200_000;

export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
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

    const title = extractMeta(html, "og:title") ?? extractTitleTag(html);
    const image = extractMeta(html, "og:image") ?? extractMeta(html, "twitter:image");

    if (!title && !image) return null;
    return {
      title: title ? decodeHtmlEntities(title).trim() : undefined,
      image: image ? decodeHtmlEntities(image).trim() : undefined,
    };
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

function extractMeta(html: string, property: string): string | undefined {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"),
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match) return match[1];
  }
  return undefined;
}

function extractTitleTag(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1];
}

function decodeHtmlEntities(str: string) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
