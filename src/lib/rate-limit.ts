import { redis } from "@/lib/redis";

/**
 * Limitador simples baseado em contador com expiração no Redis (janela
 * fixa). Assim como o `cached()` em redis.ts, é best-effort: se o Redis
 * estiver indisponível, libera a ação (fail-open) em vez de travar o site
 * inteiro por causa de uma dependência opcional — a proteção real só entra
 * em produção, onde o Redis está configurado.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  if (!redis || redis.status === "end") return { allowed: true, remaining: limit };

  try {
    const count = await redis.incr(`ratelimit:${key}`);
    if (count === 1) {
      await redis.expire(`ratelimit:${key}`, windowSeconds);
    }
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch {
    return { allowed: true, remaining: limit };
  }
}
