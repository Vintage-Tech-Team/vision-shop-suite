import { Link } from "react-router-dom";
import { productUrl } from "@/lib/shop-search";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/auth-store";
import { useWishlist } from "@/lib/store";
import { wishlistApi } from "@/lib/api";
import type { Product } from "@/lib/types";
import { effectivePrice, formatPrice } from "@/lib/types";

export function ProductCard({ product, index = 0, listView = false }: { product: Product; index?: number; listView?: boolean }) {
  const { user } = useAuth();
  const localWish = useWishlist();
  const qc = useQueryClient();
  const image = product.images?.[0]?.url;
  const price = effectivePrice(product);
  const categoryName = typeof product.category === "object" ? product.category?.name : product.category;

  const wished = user
    ? user.wishlist?.includes(product._id)
    : localWish.has(product.slug);

  const toggleMut = useMutation({
    mutationFn: () => wishlistApi.toggle(product._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
    },
    onError: () => localWish.toggle(product.slug),
  });

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) toggleMut.mutate();
    else {
      localWish.toggle(product.slug);
      toast.info("Sign in to sync your wishlist");
    }
  };

  if (listView) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="group flex gap-6 border-b border-border py-6"
      >
        <Link to={productUrl(product.slug)} className="h-40 w-32 shrink-0 overflow-hidden bg-muted">
          <img src={image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
        </Link>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{categoryName}</p>
            <Link to={productUrl(product.slug)}>
              <h3 className="font-display text-2xl hover:text-brand-primary">{product.name}</h3>
            </Link>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.shortDescription || product.description}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg tabular-nums">{formatPrice(price)}</span>
              {product.salePrice && product.salePrice < product.price && (
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
              )}
            </div>
            <button onClick={handleWish} aria-label="Wishlist">
              <Heart className={`h-4 w-4 ${wished ? "fill-brand-primary text-brand-primary" : ""}`} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link to={productUrl(product.slug)} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
          {product.salePrice && product.salePrice < product.price && (
            <span className="absolute left-3 top-3 bg-brand-primary px-2 py-1 text-[10px] uppercase tracking-widest text-white">
              Sale
            </span>
          )}
          {product.newArrival && (
            <span className="absolute left-3 top-3 bg-brand-secondary px-2 py-1 text-[10px] uppercase tracking-widest text-white">
              New
            </span>
          )}
          <button
            onClick={handleWish}
            aria-label="Toggle wishlist"
            className="absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background"
          >
            <Heart className={`h-4 w-4 ${wished ? "fill-brand-primary text-brand-primary" : ""}`} />
          </button>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <div>
            <h3 className="font-display text-xl leading-tight">{product.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{categoryName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm tabular-nums">{formatPrice(price)}</p>
            {product.salePrice && product.salePrice < product.price && (
              <p className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
