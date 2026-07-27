"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { reportSchema, type ReportInput } from "@/modules/reports/schema";

export async function createReport(input: ReportInput) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { allowed } = await checkRateLimit(`report:${session.user.id}`, 10, 60 * 60);
  if (!allowed) {
    return { error: "Muitas denúncias enviadas — tente novamente mais tarde." };
  }

  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.report.create({
    data: {
      reporterId: session.user.id,
      listingId: parsed.data.listingId,
      reason: parsed.data.reason,
      details: parsed.data.details,
    },
  });

  return { success: true as const };
}
