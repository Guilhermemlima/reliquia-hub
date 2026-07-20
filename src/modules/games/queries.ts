import { prisma } from "@/lib/prisma";

export async function listGames() {
  return prisma.game.findMany({ orderBy: { name: "asc" } });
}

export async function getGameBySlug(slug: string) {
  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      recommendations: {
        include: { part: true },
        orderBy: { targetFps: "desc" },
      },
    },
  });
  if (!game) return null;

  const byCombo = new Map<
    string,
    { resolution: string; targetFps: number; parts: typeof game.recommendations }
  >();
  for (const rec of game.recommendations) {
    const key = `${rec.resolution}-${rec.targetFps}`;
    const entry = byCombo.get(key) ?? {
      resolution: rec.resolution,
      targetFps: rec.targetFps,
      parts: [],
    };
    entry.parts.push(rec);
    byCombo.set(key, entry);
  }

  return { ...game, builds: Array.from(byCombo.values()) };
}
