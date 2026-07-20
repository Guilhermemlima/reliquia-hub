/**
 * Defesa contra open redirect e cadastro de links de domínios não
 * relacionados à loja. Usada tanto na criação da oferta quanto (de novo,
 * em profundidade) no momento do redirecionamento em /go/[offerId].
 */
export function isUrlAllowedForStore(
  url: string,
  allowedDomains: string[]
): { ok: true } | { ok: false; error: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: "URL inválida." };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, error: "A URL precisa usar HTTPS." };
  }

  const host = parsed.hostname.toLowerCase();
  const allowed = allowedDomains.some((domain) => {
    const normalized = domain.trim().toLowerCase().replace(/^\*\./, "");
    return host === normalized || host.endsWith(`.${normalized}`);
  });

  if (!allowed) {
    return {
      ok: false,
      error: `O domínio "${host}" não está na lista de domínios permitidos desta loja.`,
    };
  }

  return { ok: true };
}
