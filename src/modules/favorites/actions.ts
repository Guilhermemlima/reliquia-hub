"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleFavorite(listingId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Faça login para favoritar itens.", favorited: false };
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: session.user.id, listingId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/dashboard/favorites");
    return { success: true as const, favorited: false };
  }

  await prisma.favorite.create({
    data: { userId: session.user.id, listingId },
  });
  revalidatePath("/dashboard/favorites");
  return { success: true as const, favorited: true };
}
