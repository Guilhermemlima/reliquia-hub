"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session.user;
}

export async function moderateListing(
  listingId: string,
  status: "ACTIVE" | "REMOVED" | "FLAGGED"
) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  await prisma.listing.update({ where: { id: listingId }, data: { status } });
  revalidatePath("/admin/listings");
  return { success: true as const };
}

export async function resolveReport(
  reportId: string,
  status: "RESOLVED" | "DISMISSED"
) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  await prisma.report.update({
    where: { id: reportId },
    data: { status, resolvedAt: new Date() },
  });
  revalidatePath("/admin/reports");
  return { success: true as const };
}

export async function setUserRole(userId: string, role: "USER" | "SELLER" | "ADMIN") {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  return { success: true as const };
}

export async function setSellerVerified(userId: string, verified: boolean) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  await prisma.sellerProfile.updateMany({ where: { userId }, data: { verified } });
  revalidatePath("/admin/users");
  return { success: true as const };
}
