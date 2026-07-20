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

export async function getPartBySlug(slug: string) {
  return prisma.part.findUnique({ where: { slug } });
}

export async function getPartById(id: string) {
  return prisma.part.findUnique({ where: { id } });
}
