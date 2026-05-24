import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";
import { useWishlist } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  component: Wishlist,
  head: () => ({ meta: [{ title: "Wishlist — Atlas" }] }),
});

function Wishlist() {
  const slugs = useWishlist((s) => s.slugs);
  const saved = products.filter((p) => slugs.includes(p.slug));

  return (
    <section className="mx-auto max-w-7xl px-6 pt-16">
      <h1 className="font-display text-6xl md:text-8xl">Saved.</h1>
      <p className="mt-3 text-muted-foreground">Pieces you'd like to come back to.</p>
      {saved.length === 0 ? (
        <div className="mt-16 border-t border-border pt-16 text-center">
          <p className="text-muted-foreground">Nothing saved yet.</p>
          <Link to="/shop" className="mt-6 inline-block border-b border-foreground pb-0.5 text-sm uppercase tracking-widest">
            Find something →
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-x-6 gap-y-14 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
        </div>
      )}
    </section>
  );
}
