import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { getProduct, products } from "@/lib/products";
import { useCart, useWishlist } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Atlas` },
          { name: "description", content: loaderData.tagline },
          { property: "og:title", content: `${loaderData.name} — Atlas` },
          { property: "og:description", content: loaderData.tagline },
          { property: "og:image", content: loaderData.image },
        ]
      : [],
    links: loaderData ? [{ rel: "canonical", href: `/product/${loaderData.slug}` }] : [],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Link to="/shop" className="border-b border-foreground pb-0.5 text-sm uppercase tracking-widest">Back to shop</Link>
    </div>
  ),
});

function ProductPage() {
  const product = Route.useLoaderData();
  const [size, setSize] = useState(product.sizes[Math.floor(product.sizes.length / 2)]);
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const { has, toggle } = useWishlist();
  const wished = has(product.slug);
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <article className="mx-auto max-w-7xl px-6 pt-10">
      <nav className="text-xs uppercase tracking-widest text-muted-foreground">
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        <span className="mx-2">/</span>
        <span>{product.category}</span>
      </nav>

      <div className="mt-8 grid gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="aspect-[4/5] overflow-hidden bg-muted"
        >
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </motion.div>

        <div className="md:sticky md:top-24 md:self-start">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{product.category}</p>
          <h1 className="mt-2 font-display text-5xl leading-tight md:text-6xl">{product.name}</h1>
          <p className="mt-3 text-muted-foreground">{product.tagline}</p>
          <p className="mt-6 text-2xl tabular-nums">${product.price}</p>

          <div className="mt-10">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Colour — {product.colors[0]}</p>
            <div className="mt-3 flex gap-2">
              {product.colors.map((c) => (
                <button key={c} className="border border-border bg-secondary px-3 py-1.5 text-xs">{c}</button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-12 border px-3 py-2 text-sm transition-colors ${
                    size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-stretch gap-3">
            <div className="flex items-center border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3"><Minus className="h-3 w-3" /></button>
              <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-3"><Plus className="h-3 w-3" /></button>
            </div>
            <button
              onClick={() => add({ slug: product.slug, size, qty })}
              className="flex-1 bg-foreground py-3 text-sm uppercase tracking-widest text-background transition-transform hover:-translate-y-0.5"
            >
              Add to bag — ${product.price * qty}
            </button>
            <button
              onClick={() => toggle(product.slug)}
              aria-label="Wishlist"
              className="border border-border px-4 transition-colors hover:border-foreground"
            >
              <Heart className={`h-4 w-4 ${wished ? "fill-foreground" : ""}`} />
            </button>
          </div>

          <div className="mt-12 space-y-4 border-t border-border pt-8 text-sm">
            <p>{product.description}</p>
            <ul className="space-y-1.5 text-muted-foreground">
              {product.details.map((d) => <li key={d}>— {d}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <section className="mt-32">
        <h2 className="font-display text-4xl">You may also like.</h2>
        <div className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-3">
          {related.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
        </div>
      </section>
    </article>
  );
}
