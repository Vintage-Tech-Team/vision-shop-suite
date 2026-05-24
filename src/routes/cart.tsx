import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/store";
import { getProduct } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  component: Cart,
  head: () => ({ meta: [{ title: "Bag — Atlas" }] }),
});

function Cart() {
  const { items, remove, setQty } = useCart();
  const lines = items
    .map((i) => ({ ...i, product: getProduct(i.slug)! }))
    .filter((l) => l.product);
  const subtotal = lines.reduce((a, l) => a + l.product.price * l.qty, 0);

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16">
      <h1 className="font-display text-6xl md:text-8xl">Your bag.</h1>
      {lines.length === 0 ? (
        <div className="mt-16 border-t border-border pt-16 text-center">
          <p className="text-muted-foreground">Your bag is empty.</p>
          <Link to="/shop" className="mt-6 inline-block border-b border-foreground pb-0.5 text-sm uppercase tracking-widest">
            Browse the collection →
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-16 md:grid-cols-3">
          <ul className="md:col-span-2 divide-y divide-border border-y border-border">
            {lines.map((l) => (
              <li key={l.slug + l.size} className="flex gap-5 py-6">
                <Link to="/product/$slug" params={{ slug: l.slug }} className="h-32 w-24 shrink-0 overflow-hidden bg-muted">
                  <img src={l.product.image} alt={l.product.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-xl">{l.product.name}</p>
                      <p className="text-xs text-muted-foreground">{l.product.category} · Size {l.size}</p>
                    </div>
                    <p className="tabular-nums">${l.product.price * l.qty}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button onClick={() => setQty(l.slug, l.size, l.qty - 1)} className="p-2"><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm tabular-nums">{l.qty}</span>
                      <button onClick={() => setQty(l.slug, l.size, l.qty + 1)} className="p-2"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => remove(l.slug, l.size)} className="flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
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
              <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">${subtotal}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>Calculated next</span></div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-medium"><span>Total</span><span className="tabular-nums">${subtotal}</span></div>
            </div>
            <button className="mt-6 w-full bg-foreground py-3.5 text-sm uppercase tracking-widest text-background transition-transform hover:-translate-y-0.5">
              Checkout
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Secure payment · Free returns</p>
          </aside>
        </div>
      )}
    </section>
  );
}
