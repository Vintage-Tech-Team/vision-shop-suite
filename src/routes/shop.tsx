import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

type Search = { c?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    c: typeof s.c === "string" ? s.c : undefined,
  }),
  component: Shop,
  head: () => ({
    meta: [
      { title: "Shop — Stitch Makers" },
      { name: "description", content: "Browse the full Stitch Makers collection — sneakers, outerwear, knitwear." },
    ],
  }),
});

const categories = ["All", "Sneakers", "Outerwear", "Knitwear", "Bottoms"] as const;

function Shop() {
  const { c } = Route.useSearch();
  const [active, setActive] = useState<string>(c ?? "All");
  const filtered = active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <section className="mx-auto max-w-7xl px-6 pt-16">
      <div className="border-b border-border pb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">The Collection</p>
        <h1 className="mt-3 font-display text-6xl md:text-8xl">All pieces.</h1>
      </div>
      <div className="flex flex-wrap gap-2 py-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`border px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
              active === cat
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
        <div className="ml-auto self-center text-xs text-muted-foreground">{filtered.length} pieces</div>
      </div>
      <div className="grid gap-x-6 gap-y-14 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
      </div>
    </section>
  );
}
