"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invalidateCache } from "@/lib/redis";
import { uniqueSlug } from "@/lib/slug";
import { listingSchema, type ListingInput } from "@/modules/listings/schema";

async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function createListing(input: ListingInput) {
  const user = await requireUser();
  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const data = parsed.data;
  const slug = await uniqueSlug(data.title, async (candidate) =>
    Boolean(await prisma.listing.findUnique({ where: { slug: candidate } }))
  );

  const listing = await prisma.listing.create({
    data: {
      sellerId: user.id,
      categoryId: data.categoryId,
      title: data.title,
      slug,
      description: data.description,
      condition: data.condition,
      price: data.price,
      quantity: data.quantity,
      attributes: data.attributes,
      status: "ACTIVE",
      images: {
        create: data.images.map((image, index) => ({
          url: image.url,
          publicId: image.publicId,
          order: index,
        })),
      },
      priceHistory: {
        create: { price: data.price },
      },
    },
  });

  const existingProfile = await prisma.sellerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!existingProfile) {
    const storeName = user.name ?? "Vendedor";
    const slug = await uniqueSlug(storeName, async (candidate) =>
      Boolean(await prisma.sellerProfile.findUnique({ where: { slug: candidate } }))
    );
    await prisma.sellerProfile.create({
      data: { userId: user.id, storeName, slug },
    });
  }

  if (user.role === "USER") {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "SELLER" },
    });
  }

  await invalidateCache("search:*");
  revalidatePath("/");
  revalidatePath("/dashboard/listings");

  return { success: true as const, slug: listing.slug };
}

export async function updateListing(listingId: string, input: ListingInput) {
  const user = await requireUser();
  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing || (existing.sellerId !== user.id && user.role !== "ADMIN")) {
    return { error: "Você não tem permissão para editar este anúncio." };
  }

  const data = parsed.data;
  const priceChanged = Number(existing.price) !== data.price;

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      condition: data.condition,
      price: data.price,
      quantity: data.quantity,
      attributes: data.attributes,
      images: {
        deleteMany: {},
        create: data.images.map((image, index) => ({
          url: image.url,
          publicId: image.publicId,
          order: index,
        })),
      },
      ...(priceChanged
        ? { priceHistory: { create: { price: data.price } } }
        : {}),
    },
  });

  await invalidateCache("search:*");
  revalidatePath(`/listings/${existing.slug}`);
  revalidatePath("/dashboard/listings");

  return { success: true as const, slug: existing.slug };
}

export async function setListingStatus(
  listingId: string,
  status: "ACTIVE" | "DRAFT" | "REMOVED"
) {
  const user = await requireUser();
  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing || (existing.sellerId !== user.id && user.role !== "ADMIN")) {
    return { error: "Você não tem permissão para alterar este anúncio." };
  }

  await prisma.listing.update({ where: { id: listingId }, data: { status } });
  await invalidateCache("search:*");
  revalidatePath("/dashboard/listings");
  revalidatePath(`/listings/${existing.slug}`);

  return { success: true as const };
}
