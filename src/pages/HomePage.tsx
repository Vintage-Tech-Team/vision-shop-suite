import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Instagram, Star } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { categoryApi, productApi } from "@/lib/api";
import { shopUrl } from "@/lib/shop-search";

export default function Index() {
  const { data: home } = useQuery({
    queryKey: ["home"],
    queryFn: async () => (await productApi.home()).data.data,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await categoryApi.tree()).data.data,
  });

  const heroImage = "https://images.unsplash.com/photo-1483985988350-763728e3685b?w=1600&q=80";

  return (
    <>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-brand-secondary text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-[0.25em] text-white/70"
            >
              Spring / Summer 2026
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 font-display text-5xl leading-tight md:text-7xl"
            >
              Define Your <span className="text-brand-primary">Style</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 max-w-md text-white/80"
            >
              Premium fashion essentials for the modern wardrobe. Curated collections for Men, Women & Kids.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex gap-4">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 bg-brand-primary px-8 py-3.5 text-sm uppercase tracking-widest transition-transform hover:-translate-y-0.5"
              >
                Shop Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/shop?newArrival=true" className="border border-white/30 px-8 py-3.5 text-sm uppercase tracking-widest hover:bg-white/10">
                New Arrivals
              </Link>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
            <img src={heroImage} alt="Fashion hero" className="aspect-[4/5] w-full object-cover" loading="eager" />
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-4xl md:text-5xl">Shop by Category</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 3).map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/shop?category=${cat._id}`} className="group relative block aspect-[3/4] overflow-hidden">
                <img
                  src={cat.image || heroImage}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
                  <h3 className="font-display text-3xl text-white">{cat.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {home?.newArrivals?.length ? (
        <ProductSection title="New Arrivals" subtitle="Just dropped" products={home.newArrivals} link={{ newArrival: "true" }} />
      ) : null}

      {/* Trending */}
      {home?.trending?.length ? (
        <ProductSection title="Trending Now" subtitle="Most loved" products={home.trending} link={{ trending: "true" }} />
      ) : null}

      {/* Best Sellers */}
      {home?.bestSellers?.length ? (
        <ProductSection title="Best Sellers" subtitle="Customer favorites" products={home.bestSellers} />
      ) : null}

      {/* Flash Sale */}
      {home?.featured?.length ? (
        <section className="bg-brand-primary py-16 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/80">Limited Time</p>
                <h2 className="mt-2 font-display text-4xl md:text-5xl">Flash Sale</h2>
              </div>
              <Link to="/shop?featured=true" className="border-b border-white pb-0.5 text-sm uppercase tracking-widest">
                Shop Sale →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {home.featured.slice(0, 4).map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Customer Reviews */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-4xl">What Customers Say</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { name: "Sarah M.", text: "Exceptional quality and fast shipping. The fit is perfect!", rating: 5 },
            { name: "James K.", text: "Best online fashion store I've found. Premium feel at fair prices.", rating: 5 },
            { name: "Emily R.", text: "Love the curated collections. Every piece feels thoughtfully designed.", rating: 5 },
          ].map((review) => (
            <div key={review.name} className="border border-border p-6">
              <div className="flex gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-brand-primary text-brand-primary" />
                ))}
              </div>
              <p className="mt-4 text-muted-foreground">&ldquo;{review.text}&rdquo;</p>
              <p className="mt-4 text-sm font-medium">{review.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-y border-border bg-muted py-16">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="font-display text-3xl">Join the Stitch Makers Club</h2>
          <p className="mt-3 text-muted-foreground">Get early access to new drops, exclusive offers, and style tips.</p>
          <form className="mt-6 flex border border-border bg-background" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" className="flex-1 bg-transparent px-4 py-3 text-sm outline-none" />
            <button className="bg-brand-primary px-6 py-3 text-xs uppercase tracking-widest text-white">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Instagram Feed */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-4xl">@stitchmakers</h2>
          <Instagram className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="aspect-square overflow-hidden bg-muted">
              <img
                src={`https://images.unsplash.com/photo-${1441986300917 + n}-646876259804?w=400&q=80`}
                alt="Instagram"
                loading="lazy"
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
  link,
}: {
  title: string;
  subtitle: string;
  products: import("@/lib/types").Product[];
  link?: Record<string, string>;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{subtitle}</p>
          <h2 className="mt-2 font-display text-4xl md:text-5xl">{title}</h2>
        </div>
        <Link to={shopUrl(link)} className="hidden border-b border-foreground pb-0.5 text-sm uppercase tracking-widest md:block">
          View all →
        </Link>
      </div>
      <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((p, i) => (
          <ProductCard key={p._id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
