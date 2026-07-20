import { prisma } from "@/lib/prisma";

export async function getOrCreateConversation({
  buyerId,
  sellerId,
  listingId,
}: {
  buyerId: string;
  sellerId: string;
  listingId?: string | null;
}) {
  if (buyerId === sellerId) {
    throw new Error("Você não pode iniciar uma conversa consigo mesmo.");
  }

  const existing = await prisma.conversation.findFirst({
    where: { buyerId, sellerId, listingId: listingId ?? null },
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: { buyerId, sellerId, listingId: listingId ?? null },
  });
}

export async function listConversationsForUser(userId: string) {
  return prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: { updatedAt: "desc" },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true } },
      listing: { select: { title: true, slug: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

export async function getConversationForUser(
  conversationId: string,
  userId: string
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true } },
      listing: { select: { title: true, slug: true } },
    },
  });

  if (!conversation) return null;
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    return null;
  }

  return conversation;
}

export async function getMessages(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });
}

export async function postMessage(
  conversationId: string,
  senderId: string,
  body: string
) {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Mensagem vazia.");

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId, body: trimmed },
      include: { sender: { select: { id: true, name: true, image: true } } },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return message;
}
