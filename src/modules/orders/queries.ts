import { prisma } from "@/lib/prisma";

const orderInclude = {
  listing: { include: { images: { take: 1, orderBy: { order: "asc" as const } } } },
  buyer: { select: { id: true, name: true, image: true } },
  seller: { select: { id: true, name: true, image: true } },
  review: true,
};

export async function getBuyerOrders(userId: string) {
  return prisma.order.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    include: orderInclude,
  });
}

export async function getSellerOrders(userId: string) {
  return prisma.order.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: "desc" },
    include: orderInclude,
  });
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
}
