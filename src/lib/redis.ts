import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
  redisWarned: boolean | undefined;
};

function createClient(): Redis | undefined {
  const url = process.env.REDIS_URL;
  if (!url) return undefined;

  const client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });

  client.on("error", () => {
    if (!globalForRedis.redisWarned) {
      globalForRedis.redisWarned = true;
      console.warn(
        "[redis] indisponível — o app continua funcionando sem cache."
      );
    }
  });

  client.connect().catch(() => {});

  return client;
}

export const redis = globalForRedis.redis ?? createClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

/**
 * Cache-aside helper: tenta ler do Redis, senão computa via `loader` e
 * grava com TTL. Falha silenciosamente se o Redis estiver indisponível —
 * o cache é uma otimização, nunca uma dependência dura.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  if (!redis || redis.status === "end") return loader();

  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit) as T;
  } catch {
    // ignore cache read failures
  }

  const value = await loader();

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // ignore cache write failures
  }

  return value;
}

export async function invalidateCache(keyPattern: string) {
  if (!redis || redis.status === "end") return;
  try {
    const keys = await redis.keys(keyPattern);
    if (keys.length) await redis.del(...keys);
  } catch {
    // ignore
  }
}
