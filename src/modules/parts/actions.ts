"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { partSchema, partImageSchema, type PartInput } from "@/modules/parts/schema";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session.user;
}

export async function createPart(input: PartInput) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  const parsed = partSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const slug = await uniqueSlug(data.name, async (candidate) =>
    Boolean(await prisma.part.findUnique({ where: { slug: candidate } }))
  );

  const part = await prisma.part.create({
    data: {
      category: data.category,
      brand: data.brand,
      model: data.model,
      name: data.name,
      slug,
      ean: data.ean || undefined,
      mpn: data.mpn || undefined,
      imageUrl: data.imageUrl || undefined,
    },
  });

  revalidatePath("/admin/pecas");
  return { part };
}

export async function updatePartImage(input: { partId: string; imageUrl: string }) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  const parsed = partImageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "URL inválida." };
  }

  await prisma.part.update({
    where: { id: parsed.data.partId },
    data: { imageUrl: parsed.data.imageUrl },
  });

  revalidatePath("/admin/pecas");
  return { ok: true };
}
