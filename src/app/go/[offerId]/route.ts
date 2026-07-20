import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isUrlAllowedForStore } from "@/modules/affiliate/domain-validation";
import {
  getOrCreateAnonymousSessionId,
  normalizeSourceType,
  recordAffiliateClick,
} from "@/modules/affiliate/click";

const SESSION_COOKIE = "rh_aff_sid";

/**
 * Redirecionamento seguro para ofertas de afiliados. NUNCA aceita uma URL
 * arbitrária via query string — só resolve `offerId`s já cadastrados no
 * banco, e revalida o domínio final contra a lista de domínios permitidos
 * da loja antes de redirecionar (defesa em profundidade, não confia apenas
 * na validação feita no cadastro da oferta).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ offerId: string }> }
) {
  const { offerId } = await params;
  const url = new URL(req.url);

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { store: true },
  });

  if (!offer) {
    return NextResponse.redirect(new URL("/oferta-indisponivel", url));
  }
  if (offer.status !== "ACTIVE" || offer.store.status !== "ACTIVE") {
    return NextResponse.redirect(new URL("/oferta-indisponivel", url));
  }
  const target = offer.affiliateUrl || offer.originalUrl;
  if (!target) {
    return NextResponse.redirect(new URL("/oferta-indisponivel", url));
  }

  const domainCheck = isUrlAllowedForStore(target, offer.store.allowedDomains);
  if (!domainCheck.ok) {
    return NextResponse.redirect(new URL("/oferta-indisponivel", url));
  }

  const cookieStore = await cookies();
  const anonymousSessionId = getOrCreateAnonymousSessionId(
    cookieStore.get(SESSION_COOKIE)?.value
  );

  const userAgent = req.headers.get("user-agent") ?? "";
  const deviceType = /Mobi|Android|iPhone/i.test(userAgent) ? "mobile" : "desktop";

  await recordAffiliateClick({
    offerId: offer.id,
    storeId: offer.storeId,
    affiliateProgramId: offer.affiliateProgramId,
    anonymousSessionId,
    sourcePage: url.searchParams.get("source_page"),
    sourceType: normalizeSourceType(url.searchParams.get("source")),
    campaign: url.searchParams.get("campaign")?.slice(0, 100) ?? null,
    deviceType,
  });

  const response = NextResponse.redirect(target, { status: 302 });
  response.cookies.set(SESSION_COOKIE, anonymousSessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 180,
  });
  return response;
}
