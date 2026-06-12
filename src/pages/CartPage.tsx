import { Link } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { useCart } from "@/lib/store";
import { formatPrice } from "@/lib/types";
import { useState } from "react";
import { couponApi, orderApi } from "@/lib/api";

export default function Cart() {
  const { items, remove, setQty, clear } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState<number | null>(null);

  const subtotal = items.reduce((a, l) => a + l.price * l.qty, 0);
  const total = Math.max(0, subtotal + (shippingCost ?? 0) - discount);

  const applyCoupon = async () => {
    try {
      const res = await couponApi.validate(couponCode, subtotal);
      setDiscount(res.data.data.discount);
      toast.success("Coupon applied!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Invalid coupon");
    }
  };

  const estimateShipping = async () => {
    try {
      const res = await orderApi.estimateShipping("standard");
      setShippingCost(res.data.data.cost);
      toast.success("Shipping estimated");
    } catch {
      setShippingCost(9.99);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16">
      <h1 className="font-display text-6xl md:text-8xl">Your bag.</h1>
      {items.length === 0 ? (
        <div className="mt-16 border-t border-border pt-16 text-center">
          <p className="text-muted-foreground">Your bag is empty.</p>
          <Link to="/shop" className="mt-6 inline-block border-b border-foreground pb-0.5 text-sm uppercase tracking-widest">
            Browse the collection →
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-16 md:grid-cols-3">
          <ul className="md:col-span-2 divide-y divide-border border-y border-border">
            {items.map((l) => (
              <li key={l.productId + l.size + l.color} className="flex gap-5 py-6">
                <Link to={`/product/${l.slug }`} className="h-32 w-24 shrink-0 overflow-hidden bg-muted">
                  <img src={l.image} alt={l.name} loading="lazy" className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-xl">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.size} · {l.color}</p>
                    </div>
                    <p className="tabular-nums">{formatPrice(l.price * l.qty)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button onClick={() => setQty(l.productId, l.size, l.color, l.qty - 1)} className="p-2"><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm tabular-nums">{l.qty}</span>
                      <button onClick={() => setQty(l.productId, l.size, l.color, l.qty + 1)} className="p-2"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button
                      onClick={() => { remove(l.productId, l.size, l.color); toast.info("Item removed"); }}
                      className="flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit border border-border p-6 md:sticky md:top-24">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Summary</p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <button onClick={estimateShipping} className="underline">{shippingCost !== null ? formatPrice(shippingCost) : "Estimate"}</button>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-brand-primary"><span>Discount</span><span>-{formatPrice(discount)}</span></div>
              )}
              <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
                <span>Total</span><span className="tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon" className="field-input flex-1 text-xs" />
              <button onClick={applyCoupon} className="border border-border px-3 text-xs uppercase">Apply</button>
            </div>
            <Link to="/checkout" className="mt-6 block w-full bg-brand-primary py-3.5 text-center text-sm uppercase tracking-widest text-white transition-transform hover:-translate-y-0.5">
              Checkout
            </Link>
            <button onClick={() => { clear(); toast.info("Cart cleared"); }} className="mt-3 w-full text-xs text-muted-foreground underline">
              Clear cart
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
