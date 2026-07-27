// Constantes puras, sem nenhum import server-only (Prisma/Redis) — seguro
// pra importar de componentes "use client" também.
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
  PERIPHERAL: "Periférico",
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
