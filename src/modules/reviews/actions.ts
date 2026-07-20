"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema, type ReviewInput } from "@/modules/reviews/schema";

export async function submitReview(orderId: string, input: ReviewInput) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { review: true },
  });

  if (!order || order.buyerId !== session.user.id) {
    return { error: "Pedido não encontrado." };
  }
  if (order.status !== "COMPLETED") {
    return { error: "Você só pode avaliar pedidos concluídos." };
  }
  if (order.review) {
    return { error: "Você já avaliou este pedido." };
  }

  await prisma.review.create({
    data: {
      orderId: order.id,
      authorId: session.user.id,
      targetId: order.sellerId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { targetId: order.sellerId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.sellerProfile.updateMany({
    where: { userId: order.sellerId },
    data: {
      ratingAvg: agg._avg.rating ?? 0,
      ratingCount: agg._count.rating,
    },
  });

  revalidatePath("/dashboard/orders");
  return { success: true as const };
}
