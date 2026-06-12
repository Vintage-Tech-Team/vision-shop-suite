import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi, wishlistApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useWishlist } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { products as mockProducts } from "@/lib/products";

export default function Wishlist() {
  const { user } = useAuth();
  const localSlugs = useWishlist((s) => s.slugs);

  const { data: apiProducts = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => (await wishlistApi.get()).data.data,
    enabled: !!user,
  });

  const localProducts = mockProducts.filter((p) => localSlugs.includes(p.slug)).map((p) => ({
    _id: p.slug,
    name: p.name,
    slug: p.slug,
    sku: p.slug,
    description: p.description,
    category: p.category,
    brand: "Stitch Makers",
    images: [{ url: p.image }],
    sizes: p.sizes,
    colors: p.colors.map((c) => ({ name: c, hexCode: "#888" })),
    stock: 10,
    price: p.price,
    rating: 4.5,
    reviewsCount: 0,
  }));

  const items = user ? apiProducts : localProducts;

  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 pb-16">
      <h1 className="font-display text-6xl">Wishlist.</h1>
      {!items.length ? (
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">Nothing saved yet.</p>
          <Link to="/shop" className="mt-6 inline-block border-b border-foreground pb-0.5 text-sm uppercase tracking-widest">Browse →</Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p._id} product={p as import("@/lib/types").Product} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
