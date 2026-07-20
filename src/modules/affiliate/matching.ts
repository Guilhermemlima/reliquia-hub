import type { Part } from "@prisma/client";

export type MatchMethod = "slug" | "ean" | "mpn" | "brand_model" | "fuzzy_name" | "none";

export type MatchCandidate = {
  partId: string;
  confidence: number;
  method: MatchMethod;
};

/** Score mínimo para associar automaticamente, sem revisão humana. */
export const AUTO_MATCH_THRESHOLD = 0.9;
/** Abaixo disso, nem entra na fila de revisão — é erro (sem candidato plausível). */
export const MIN_REVIEW_THRESHOLD = 0.5;

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Tenta associar uma linha importada (sem part_slug exato) a uma peça do
 * catálogo, por ordem de confiabilidade: EAN > MPN > marca+modelo > nome
 * aproximado. Nunca inventa — sem nenhum sinal em comum, retorna null.
 */
export function matchPartForRow(
  row: { ean?: string; mpn?: string; brand?: string; model?: string; label: string },
  parts: Part[]
): MatchCandidate | null {
  if (row.ean) {
    const hit = parts.find((p) => p.ean && p.ean === row.ean);
    if (hit) return { partId: hit.id, confidence: 0.98, method: "ean" };
  }

  if (row.mpn) {
    const hit = parts.find((p) => p.mpn && p.mpn.toLowerCase() === row.mpn!.toLowerCase());
    if (hit) return { partId: hit.id, confidence: 0.97, method: "mpn" };
  }

  if (row.brand && row.model) {
    const brandNorm = normalize(row.brand);
    const modelNorm = normalize(row.model);
    const hit = parts.find(
      (p) => normalize(p.brand) === brandNorm && normalize(p.model) === modelNorm
    );
    if (hit) return { partId: hit.id, confidence: 0.87, method: "brand_model" };
  }

  const labelNorm = normalize(row.label);
  if (labelNorm) {
    let best: { part: Part; score: number } | null = null;
    for (const part of parts) {
      const nameNorm = normalize(part.name);
      if (!nameNorm) continue;
      let score = 0;
      if (nameNorm === labelNorm) score = 0.95;
      else if (labelNorm.includes(nameNorm) || nameNorm.includes(labelNorm)) score = 0.7;
      else {
        const labelTokens = new Set(labelNorm.split(" "));
        const nameTokens = nameNorm.split(" ").filter(Boolean);
        const overlap = nameTokens.filter((t) => labelTokens.has(t)).length;
        score = nameTokens.length ? (overlap / nameTokens.length) * 0.65 : 0;
      }
      if (!best || score > best.score) best = { part, score };
    }
    if (best && best.score >= MIN_REVIEW_THRESHOLD) {
      return { partId: best.part.id, confidence: best.score, method: "fuzzy_name" };
    }
  }

  return null;
}
