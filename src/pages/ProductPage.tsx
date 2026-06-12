import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, Star, ZoomIn } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { productApi, reviewApi, wishlistApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useCart, useWishlist } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { effectivePrice, formatPrice, type Product } from "@/lib/types";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await productApi.get(slug!)).data.data,
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-6 py-20 text-muted-foreground">Loading product...</div>;
  }

  if (isError || !data) {
    return <Navigate to="/shop" replace />;
  }

  return <ProductDetails product={data.product} related={data.related} />;
}

function ProductDetails({ product, related }: { product: Product; related: Product[] }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [size, setSize] = useState(product.sizes[Math.floor(product.sizes.length / 2)] || product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]?.name || "Default");
  const [qty, setQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const add = useCart((s) => s.add);
  const localWish = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const price = effectivePrice(product);
  const categoryName = typeof product.category === "object" ? product.category?.name : "";

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", product.slug],
    queryFn: async () => (await reviewApi.list(product.slug)).data.data,
  });

  const wishMut = useMutation({
    mutationFn: () => wishlistApi.toggle(product._id),
    onSuccess: () => toast.success("Wishlist updated"),
  });

  const reviewMut = useMutation({
    mutationFn: () => reviewApi.create(product.slug, { rating: reviewRating, comment: reviewComment }),
    onSuccess: () => { toast.success("Review submitted"); setReviewComment(""); },
    onError: () => toast.error("Sign in to leave a review"),
  });

  const wished = user ? user.wishlist?.includes(product._id) : localWish.has(product.slug);

  const handleAddToCart = () => {
    if (product.stock < qty) { toast.error("Insufficient stock"); return; }
    add({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.url,
      price,
      size,
      color,
      qty,
    });
    toast.success("Product added to cart!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout" );
  };

  return (
    <article className="mx-auto max-w-7xl px-6 pt-10 pb-20">
      <nav className="text-xs uppercase tracking-widest text-muted-foreground">
        <Link to="/shop">Shop</Link><span className="mx-2">/</span><span>{categoryName}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <motion.div
            className={`relative aspect-[4/5] overflow-hidden bg-muted ${zoom ? "cursor-zoom-in" : ""}`}
            onClick={() => setZoom(!zoom)}
          >
            <img
              src={product.images[selectedImage]?.url}
              alt={product.name}
              className={`h-full w-full object-cover transition-transform duration-500 ${zoom ? "scale-150" : ""}`}
            />
            <button className="absolute bottom-4 right-4 rounded-full bg-background/80 p-2"><ZoomIn className="h-4 w-4" /></button>
          </motion.div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`h-20 w-16 shrink-0 overflow-hidden border-2 ${selectedImage === i ? "border-brand-primary" : "border-transparent"}`}>
                  <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{product.brand}</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-brand-primary text-brand-primary" : "text-muted"}`} />
            ))}
            <span className="text-sm text-muted-foreground">({product.reviewsCount} reviews)</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl tabular-nums">{formatPrice(price)}</span>
            {product.salePrice && product.salePrice < product.price && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          <p className={`mt-2 text-sm ${product.stock > 0 ? "text-green-600" : "text-brand-primary"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Color — {color}</p>
            <div className="mt-3 flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  title={c.name}
                  className={`h-8 w-8 rounded-full border-2 ${color === c.name ? "border-brand-primary" : "border-border"}`}
                  style={{ backgroundColor: c.hexCode }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`min-w-12 border px-3 py-2 text-sm ${size === s ? "border-brand-primary bg-brand-primary text-white" : "border-border"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-stretch gap-3">
            <div className="flex items-center border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3"><Minus className="h-3 w-3" /></button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-3"><Plus className="h-3 w-3" /></button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary flex-1">
              Add to Cart
            </button>
            <button onClick={() => user ? wishMut.mutate() : localWish.toggle(product.slug)} className="border border-border px-4">
              <Heart className={`h-4 w-4 ${wished ? "fill-brand-primary text-brand-primary" : ""}`} />
            </button>
          </div>
          <button onClick={handleBuyNow} disabled={product.stock === 0} className="mt-3 w-full border border-brand-secondary py-3.5 text-sm uppercase tracking-widest hover:bg-brand-secondary hover:text-white">
            Buy Now
          </button>

          <div className="mt-10 space-y-4 border-t border-border pt-8 text-sm">
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20">
        <h2 className="font-display text-3xl">Reviews</h2>
        {user && (
          <form onSubmit={(e) => { e.preventDefault(); reviewMut.mutate(); }} className="mt-6 space-y-4 border border-border p-6">
            <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="field-input">
              {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
            </select>
            <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Your review..." className="field-input min-h-24" required />
            <button type="submit" className="btn-primary px-8">Submit Review</button>
          </form>
        )}
        <ul className="mt-6 divide-y divide-border">
          {reviewsData?.reviews?.map((r) => (
            <li key={r._id} className="py-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">{r.user.name}</span>
                <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-1 text-sm">{r.comment}</p>
            </li>
          )) ?? <li className="py-4 text-muted-foreground">No reviews yet.</li>}
        </ul>
      </section>

      {/* Related */}
      {related?.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl">Related Products</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => <ProductCard key={p._id} product={p as typeof product} index={i} />)}
          </div>
        </section>
      )}

      {/* Frequently bought together */}
      {related?.length >= 2 && (
        <section className="mt-16 border border-border p-6">
          <h2 className="font-display text-2xl">Frequently Bought Together</h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {[product, ...related.slice(0, 2)].map((p, i) => (
              <div key={p._id} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted-foreground">+</span>}
                <img src={(p as typeof product).images?.[0]?.url} alt={p.name} className="h-20 w-16 object-cover" />
              </div>
            ))}
            <button onClick={handleAddToCart} className="btn-primary ml-auto px-6">Add All to Cart</button>
          </div>
        </section>
      )}
    </article>
  );
}
