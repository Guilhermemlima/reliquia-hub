"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUrlAllowedForStore } from "@/modules/affiliate/domain-validation";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session.user;
}

type ReviewPayload = {
  partId: string;
  storeId: string;
  sellerName?: string;
  normalPrice: number;
  pixPrice?: number;
  shippingPrice?: number;
  condition: "NEW" | "USED" | "REFURBISHED";
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
  originalUrl: string;
  affiliateUrl: string;
};

export async function approveMatchReview(reviewId: string, overridePartId?: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  const review = await prisma.offerMatchReview.findUnique({ where: { id: reviewId } });
  if (!review || review.status !== "PENDING") {
    return { error: "Revisão não encontrada ou já processada." };
  }

  const payload = review.payload as unknown as ReviewPayload;
  const partId = overridePartId || payload.partId;

  const store = await prisma.store.findUnique({ where: { id: payload.storeId } });
  if (!store) return { error: "Loja não encontrada." };

  const check = isUrlAllowedForStore(payload.affiliateUrl, store.allowedDomains);
  if (!check.ok) return { error: check.error };

  const existing = await prisma.offer.findFirst({
    where: { partId, storeId: payload.storeId, originalUrl: payload.originalUrl },
  });
  if (existing) {
    await prisma.offerMatchReview.update({
      where: { id: reviewId },
      data: { status: "REJECTED", reviewedBy: admin.id, reviewedAt: new Date() },
    });
    return { error: "Já existe uma oferta igual — revisão descartada." };
  }

  await prisma.$transaction([
    prisma.offer.create({
      data: {
        partId,
        storeId: payload.storeId,
        sellerName: payload.sellerName,
        normalPrice: payload.normalPrice,
        pixPrice: payload.pixPrice,
        shippingPrice: payload.shippingPrice,
        condition: payload.condition,
        availability: payload.availability,
        originalUrl: payload.originalUrl,
        affiliateUrl: payload.affiliateUrl,
        source: "MANUAL",
        priceHistory: {
          create: {
            normalPrice: payload.normalPrice,
            pixPrice: payload.pixPrice,
            shippingPrice: payload.shippingPrice,
            availability: payload.availability,
          },
        },
      },
    }),
    prisma.offerMatchReview.update({
      where: { id: reviewId },
      data: { status: "APPROVED", reviewedBy: admin.id, reviewedAt: new Date() },
    }),
  ]);

  revalidatePath("/admin/afiliados/revisao");
  revalidatePath("/admin/afiliados/ofertas");
  revalidatePath("/montador");
  return { success: true as const };
}

export async function rejectMatchReview(reviewId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  await prisma.offerMatchReview.update({
    where: { id: reviewId },
    data: { status: "REJECTED", reviewedBy: admin.id, reviewedAt: new Date() },
  });

  revalidatePath("/admin/afiliados/revisao");
  return { success: true as const };
}
