import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export type ShopSearch = {
  category?: string;
  subCategory?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  size?: string;
  color?: string;
  rating?: string;
  inStock?: string;
  featured?: string;
  trending?: string;
  newArrival?: string;
  search?: string;
  sort?: string;
};

const SHOP_KEYS = [
  "category",
  "subCategory",
  "brand",
  "minPrice",
  "maxPrice",
  "size",
  "color",
  "rating",
  "inStock",
  "featured",
  "trending",
  "newArrival",
  "search",
  "sort",
] as const;

export function shopUrl(params?: Record<string, string | undefined>) {
  if (!params) return "/shop";
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) q.set(key, value);
  }
  const query = q.toString();
  return query ? `/shop?${query}` : "/shop";
}

export function productUrl(slug: string) {
  return `/product/${slug}`;
}

export function useShopSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const search = useMemo(() => {
    const result: ShopSearch = {};
    for (const key of SHOP_KEYS) {
      const value = searchParams.get(key);
      if (value) result[key] = value;
    }
    return result;
  }, [searchParams]);

  const updateSearch = useCallback(
    (updates: Partial<ShopSearch>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries({ ...search, ...updates })) {
        if (!value) next.delete(key);
        else next.set(key, value);
      }
      setSearchParams(next);
    },
    [search, searchParams, setSearchParams],
  );

  return { search, updateSearch, navigate };
}
