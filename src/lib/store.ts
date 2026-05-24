import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  slug: string;
  size: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (slug: string, size: string) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const i = s.items.findIndex((x) => x.slug === item.slug && x.size === item.size);
          if (i >= 0) {
            const next = [...s.items];
            next[i] = { ...next[i], qty: next[i].qty + item.qty };
            return { items: next };
          }
          return { items: [...s.items, item] };
        }),
      remove: (slug, size) =>
        set((s) => ({ items: s.items.filter((x) => !(x.slug === slug && x.size === size)) })),
      setQty: (slug, size, qty) =>
        set((s) => ({
          items: s.items.map((x) =>
            x.slug === slug && x.size === size ? { ...x, qty: Math.max(1, qty) } : x,
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "atlas-cart" },
  ),
);

type WishState = {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
};

export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set((s) => ({
          slugs: s.slugs.includes(slug) ? s.slugs.filter((x) => x !== slug) : [...s.slugs, slug],
        })),
      has: (slug) => get().slugs.includes(slug),
    }),
    { name: "atlas-wish" },
  ),
);

type ThemeState = { theme: "light" | "dark"; toggle: () => void };
export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      toggle: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    { name: "atlas-theme" },
  ),
);
