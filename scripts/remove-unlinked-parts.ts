/**
 * Remove peças sem nenhuma oferta associada (usado pra limpar a importação
 * em massa do BuildCores OpenDB, que trouxe ~2.400 itens de uma vez sem
 * verificação individual). Peças que já têm oferta (link cadastrado) nunca
 * são afetadas.
 *
 * Uso: npx tsx scripts/remove-unlinked-parts.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const { count } = await prisma.part.deleteMany({
    where: { offers: { none: {} } },
  });
  console.log(`Removidas ${count} peças sem oferta associada.`);

  const remaining = await prisma.part.count();
  console.log(`Peças restantes no catálogo: ${remaining}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
