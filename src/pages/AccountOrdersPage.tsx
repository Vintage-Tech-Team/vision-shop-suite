import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { ORDER_STATUS_LABELS, formatPrice } from "@/lib/types";

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => (await orderApi.my()).data.data,
  });

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <Link to="/account" className="text-xs uppercase tracking-widest text-muted-foreground">← Account</Link>
      <h1 className="mt-4 font-display text-5xl">Order History</h1>

      {isLoading ? (
        <div className="mt-8 space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse bg-muted" />)}</div>
      ) : !orders.length ? (
        <p className="mt-8 text-muted-foreground">No orders yet. <Link to="/shop" className="underline">Start shopping</Link></p>
      ) : (
        <ul className="mt-8 divide-y divide-border">
          {orders.map((o) => (
            <li key={o._id} className="py-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p>
                  <span className="mt-2 inline-block bg-muted px-2 py-0.5 text-xs uppercase">{ORDER_STATUS_LABELS[o.orderStatus]}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg tabular-nums">{formatPrice(o.total)}</p>
                  <p className="text-xs text-muted-foreground">{o.items.length} item(s)</p>
                </div>
              </div>
              {o.trackingNumber && (
                <p className="mt-2 text-sm">Tracking: <span className="font-mono">{o.trackingNumber}</span></p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
