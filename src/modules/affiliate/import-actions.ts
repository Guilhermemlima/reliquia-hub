"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import type { OfferCsvRow } from "@/modules/affiliate/csv";
import { processOfferImportRows, type ImportSummary } from "@/modules/affiliate/import-service";

export type { ImportSummary, ImportRowResult } from "@/modules/affiliate/import-service";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session.user;
}

export async function importOffersCsv(
  rows: OfferCsvRow[]
): Promise<ImportSummary | { error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  const result = await processOfferImportRows(rows);

  if (!("error" in result)) {
    revalidatePath("/admin/afiliados/ofertas");
    revalidatePath("/montador");
  }

  return result;
}
