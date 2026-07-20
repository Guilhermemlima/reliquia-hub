"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paymentProvider } from "@/modules/payments/provider";

async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type StartCheckoutResult =
  | { error: string }
  | { devMode: true; orderId: string }
  | { url: string };

export async function startCheckout(
  listingId: string
): Promise<StartCheckoutResult> {
  const user = await requireUser();

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { images: { take: 1, orderBy: { order: "asc" } } },
  });

  if (!listing || listing.status !== "ACTIVE") {
    return { error: "Este anúncio não está mais disponível." };
  }
  if (listing.sellerId === user.id) {
    return { error: "Você não pode comprar seu próprio anúncio." };
  }

  const order = await prisma.order.create({
    data: {
      buyerId: user.id,
      sellerId: listing.sellerId,
      listingId: listing.id,
      amount: listing.price,
      currency: listing.currency,
      status: "PENDING",
    },
  });

  if (!paymentProvider.enabled) {
    // Stripe ainda não configurado: simula pagamento aprovado para permitir
    // testar o fluxo completo de pedido em ambiente de desenvolvimento.
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } }),
      prisma.listing.update({
        where: { id: listing.id },
        data: { status: "SOLD" },
      }),
    ]);
    revalidatePath("/dashboard/orders");
    return { devMode: true as const, orderId: order.id };
  }

  const result = await paymentProvider.createCheckoutSession({
    orderId: order.id,
    amount: Number(listing.price),
    currency: listing.currency,
    productName: listing.title,
    productImage: listing.images[0]?.url,
    buyerEmail: user.email,
    successUrl: `${APP_URL}/checkout/success?orderId=${order.id}`,
    cancelUrl: `${APP_URL}/listings/${listing.slug}`,
  });

  if ("error" in result) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    return { error: result.error };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: result.sessionId },
  });

  return { url: result.url };
}

export async function markShipped(orderId: string) {
  const user = await requireUser();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.sellerId !== user.id) {
    return { error: "Pedido não encontrado." };
  }
  if (order.status !== "PAID") {
    return { error: "O pedido precisa estar pago para marcar como enviado." };
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: "SHIPPED" } });
  revalidatePath("/dashboard/orders");
  return { success: true as const };
}

export async function confirmReceipt(orderId: string) {
  const user = await requireUser();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== user.id) {
    return { error: "Pedido não encontrado." };
  }
  if (order.status !== "PAID" && order.status !== "SHIPPED") {
    return { error: "Este pedido não pode ser confirmado agora." };
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED", escrowReleasedAt: new Date() },
    }),
    prisma.sellerProfile.updateMany({
      where: { userId: order.sellerId },
      data: { totalSales: { increment: 1 } },
    }),
  ]);

  revalidatePath("/dashboard/orders");
  return { success: true as const };
}
