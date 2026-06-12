import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  remove: (productId: string, size: string, color: string) => void;
  setQty: (productId: string, size: string, color: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const qty = item.qty ?? 1;
          const i = s.items.findIndex(
            (x) => x.productId === item.productId && x.size === item.size && x.color === item.color,
          );
          if (i >= 0) {
            const next = [...s.items];
            next[i] = { ...next[i], qty: next[i].qty + qty };
            return { items: next };
          }
          return { items: [...s.items, { ...item, qty }] };
        }),
      remove: (productId, size, color) =>
        set((s) => ({
          items: s.items.filter(
            (x) => !(x.productId === productId && x.size === size && x.color === color),
          ),
        })),
      setQty: (productId, size, color, qty) =>
        set((s) => ({
          items: s.items.map((x) =>
            x.productId === productId && x.size === size && x.color === color
              ? { ...x, qty: Math.max(1, qty) }
              : x,
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "stitch-makers-cart" },
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
    { name: "stitch-makers-wish" },
  ),
);

type ThemeState = { theme: "light" | "dark"; toggle: () => void };
export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      toggle: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    { name: "stitch-makers-theme" },
  ),
);
