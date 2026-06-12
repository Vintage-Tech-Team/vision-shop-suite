import { cacheGet, cacheSet, cacheDel } from "../config/redis.js";

export const withCache = async (key, fetchFn, ttl = 300) => {
  const cached = await cacheGet(key);
  if (cached) return cached;
  const data = await fetchFn();
  await cacheSet(key, data, ttl);
  return data;
};

export const invalidateProductCache = () => cacheDel("products:*");
export const invalidateCategoryCache = () => cacheDel("categories:*");
