import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist } from "@/lib/store";
import type { Product } from "@/lib/products";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { has, toggle } = useWishlist();
  const wished = has(product.slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
          <button
            onClick={(e) => { e.preventDefault(); toggle(product.slug); }}
            aria-label="Toggle wishlist"
            className="absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background"
          >
            <Heart className={`h-4 w-4 ${wished ? "fill-foreground" : ""}`} />
          </button>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <div>
            <h3 className="font-display text-xl leading-tight">{product.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{product.category}</p>
          </div>
          <p className="text-sm tabular-nums">${product.price}</p>
        </div>
      </Link>
    </motion.div>
  );
}
