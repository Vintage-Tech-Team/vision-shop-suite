import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Stitch Makers — Made slowly. Worn forever." },
      { name: "description", content: "Premium hand-finished essentials." },
    ],
  }),
});

function Index() {
  const featured = products.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 pt-12 md:grid-cols-12 md:gap-6 md:pt-20">
          <div className="md:col-span-5 md:pt-16">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
            >
              Spring Collection — 04
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 font-display text-6xl leading-[0.95] text-balance md:text-[7rem]"
            >
              Made slowly.<br />
              <em className="font-normal text-muted-foreground">Worn forever.</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 max-w-md text-muted-foreground"
            >
              Hand-finished sneakers, outerwear and knitwear from a small studio.
              Built on better materials, refined over many prototypes, priced without the markup.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex items-center gap-6"
            >
              <Link
                to="/shop"
                className="group inline-flex items-center gap-3 bg-foreground px-6 py-3.5 text-sm uppercase tracking-widest text-background transition-transform hover:-translate-y-0.5"
              >
                Shop the collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/journal" className="border-b border-foreground pb-0.5 text-sm uppercase tracking-widest">
                Our craft
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-7"
          >
            <div className="relative aspect-[5/6] overflow-hidden">
              <img src={hero} alt="Stitch Makers signature sneaker" className="h-full w-full object-cover" width={1600} height={1200} />
              <div className="absolute bottom-6 left-6 max-w-xs bg-background/85 p-5 backdrop-blur-md">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">No. 01</p>
                <p className="mt-1 font-display text-2xl">The Stitch Low</p>
                <p className="mt-1 text-xs text-muted-foreground">Italian leather · Made in Portugal</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-6 pt-32">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Selected</p>
            <h2 className="mt-2 font-display text-5xl md:text-6xl">This month's three.</h2>
          </div>
          <Link to="/shop" className="hidden border-b border-foreground pb-0.5 text-sm uppercase tracking-widest md:block">
            View all →
          </Link>
        </div>
        <div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-3">
          {featured.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
        </div>
      </section>

      {/* Manifesto strip */}
      <section className="mx-auto max-w-5xl px-6 pt-40 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">A philosophy</p>
        <p className="mt-6 font-display text-3xl leading-snug text-balance md:text-5xl">
          We make fewer things, and better. Each piece begins with a material — Tuscan leather,
          Biella wool, Japanese loopback — and ends only when there is nothing left to remove.
        </p>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 pt-32">
        <div className="grid gap-6 md:grid-cols-2">
          {[products[3], products[4]].map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="group relative aspect-[4/5] overflow-hidden bg-muted"
            >
              <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1500ms] group-hover:scale-105" />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/40 to-transparent p-8 text-white">
                <p className="text-xs uppercase tracking-widest opacity-80">{p.category}</p>
                <h3 className="mt-1 font-display text-4xl">{p.name}</h3>
                <Link to="/product/$slug" params={{ slug: p.slug }} className="mt-3 w-fit border-b border-white pb-0.5 text-xs uppercase tracking-widest">
                  Discover →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
