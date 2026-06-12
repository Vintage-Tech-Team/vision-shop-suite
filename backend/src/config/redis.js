/**
 * Redis caching layer — ready for production.
 * Install ioredis and uncomment when REDIS_URL is configured.
 */
let redisClient = null;

export const getRedis = () => redisClient;

export const initRedis = async () => {
  if (!process.env.REDIS_URL) return null;
  try {
    const { default: Redis } = await import("ioredis");
    redisClient = new Redis(process.env.REDIS_URL);
    console.log("Redis connected");
    return redisClient;
  } catch {
    console.warn("Redis not available — caching disabled");
    return null;
  }
};

export const cacheGet = async (key) => {
  if (!redisClient) return null;
  const val = await redisClient.get(key);
  return val ? JSON.parse(val) : null;
};

export const cacheSet = async (key, value, ttlSeconds = 300) => {
  if (!redisClient) return;
  await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
};

export const cacheDel = async (pattern) => {
  if (!redisClient) return;
  const keys = await redisClient.keys(pattern);
  if (keys.length) await redisClient.del(...keys);
};
