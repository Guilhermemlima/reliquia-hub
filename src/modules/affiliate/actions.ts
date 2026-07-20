"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { isUrlAllowedForStore } from "@/modules/affiliate/domain-validation";
import { generateAffiliateLink } from "@/modules/affiliate/link-service";
import {
  storeSchema,
  programSchema,
  offerSchema,
  type StoreInput,
  type ProgramInput,
  type OfferInput,
} from "@/modules/affiliate/schema";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session.user;
}

export async function createStore(input: StoreInput) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  const parsed = storeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const data = parsed.data;
  const slug = await uniqueSlug(data.slug || data.name, async (candidate) =>
    Boolean(await prisma.store.findUnique({ where: { slug: candidate } }))
  );

  await prisma.store.create({
    data: {
      name: data.name,
      slug,
      logoUrl: data.logoUrl || undefined,
      websiteUrl: data.websiteUrl || undefined,
      allowedDomains: data.allowedDomains.map((d) =>
        d.trim().toLowerCase().replace(/^https?:\/\//, "")
      ),
    },
  });

  revalidatePath("/admin/afiliados");
  return { success: true as const };
}

export async function setStoreStatus(storeId: string, status: "ACTIVE" | "INACTIVE") {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  await prisma.store.update({ where: { id: storeId }, data: { status } });
  revalidatePath("/admin/afiliados");
  return { success: true as const };
}

export async function createProgram(input: ProgramInput) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  const parsed = programSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  await prisma.affiliateProgram.create({
    data: {
      storeId: data.storeId,
      name: data.name,
      providerType: data.providerType,
      affiliateIdentifier: data.affiliateIdentifier,
      commissionDescription: data.commissionDescription,
      cookieDurationDescription: data.cookieDurationDescription,
      termsUrl: data.termsUrl || undefined,
    },
  });

  revalidatePath("/admin/afiliados");
  return { success: true as const };
}

export async function testProgramConnection(programId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  const program = await prisma.affiliateProgram.findUnique({ where: { id: programId } });
  if (!program) return { error: "Programa não encontrado." };

  const { getAffiliateProvider } = await import("@/modules/affiliate/provider");
  const provider = getAffiliateProvider(program.providerType);
  const result = await provider.testConnection();

  await prisma.affiliateProgram.update({
    where: { id: programId },
    data: { lastConnectionTest: new Date() },
  });

  revalidatePath("/admin/afiliados");
  return result;
}

export async function createOffer(input: OfferInput) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  const parsed = offerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const store = await prisma.store.findUnique({ where: { id: data.storeId } });
  if (!store) return { error: "Loja não encontrada." };

  const originalCheck = isUrlAllowedForStore(data.originalUrl, store.allowedDomains);
  if (!originalCheck.ok) return { error: originalCheck.error };

  let affiliateUrl = data.affiliateUrl || "";
  if (!affiliateUrl) {
    const program = data.affiliateProgramId
      ? await prisma.affiliateProgram.findUnique({ where: { id: data.affiliateProgramId } })
      : null;
    const result = await generateAffiliateLink({
      providerType: program?.providerType ?? "MANUAL",
      originalUrl: data.originalUrl,
      allowedDomains: store.allowedDomains,
      affiliateIdentifier: program?.affiliateIdentifier,
    });
    if (result.status !== "generated") {
      return {
        error:
          "reason" in result
            ? result.reason
            : "Não foi possível gerar o link de afiliado.",
      };
    }
    affiliateUrl = result.url;
  } else {
    const affiliateCheck = isUrlAllowedForStore(affiliateUrl, store.allowedDomains);
    if (!affiliateCheck.ok) return { error: affiliateCheck.error };
  }

  const offer = await prisma.offer.create({
    data: {
      partId: data.partId,
      storeId: data.storeId,
      affiliateProgramId: data.affiliateProgramId || undefined,
      sellerName: data.sellerName,
      normalPrice: data.normalPrice,
      pixPrice: data.pixPrice,
      installmentPrice: data.installmentPrice,
      installmentCount: data.installmentCount,
      shippingPrice: data.shippingPrice,
      availability: data.availability,
      condition: data.condition,
      originalUrl: data.originalUrl,
      affiliateUrl,
      source: "MANUAL",
      priceHistory: {
        create: {
          normalPrice: data.normalPrice,
          pixPrice: data.pixPrice,
          shippingPrice: data.shippingPrice,
          availability: data.availability,
        },
      },
    },
  });

  revalidatePath("/admin/afiliados/ofertas");
  revalidatePath("/montador");
  return { success: true as const, offerId: offer.id };
}

export async function setOfferStatus(
  offerId: string,
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "PENDING_REVIEW"
) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Acesso negado." };

  await prisma.offer.update({ where: { id: offerId }, data: { status } });
  revalidatePath("/admin/afiliados/ofertas");
  revalidatePath("/montador");
  return { success: true as const };
}
