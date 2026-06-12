import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { ORDER_STATUS_LABELS, formatPrice } from "@/lib/types";

export default function Account() {
  const { user } = useAuth();
  const { data: orders } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => (await orderApi.my(1)).data.data,
  });

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-5xl">My Account</h1>
      <p className="mt-2 text-muted-foreground">Welcome, {user?.name}</p>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        <nav className="space-y-2">
          <Link to="/account" className="block border-l-2 border-brand-primary pl-4 py-2 text-sm font-medium">Overview</Link>
          <Link to="/account/orders" className="block pl-4 py-2 text-sm text-muted-foreground hover:text-foreground">Orders</Link>
          <Link to="/account/addresses" className="block pl-4 py-2 text-sm text-muted-foreground hover:text-foreground">Addresses</Link>
        </nav>

        <div className="md:col-span-2 space-y-8">
          <div className="border border-border p-6">
            <h2 className="font-display text-2xl">Profile</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{user?.name}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{user?.email}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{user?.phone || "—"}</dd></div>
            </dl>
          </div>

          <div className="border border-border p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Recent Orders</h2>
              <Link to="/account/orders" className="text-xs uppercase tracking-widest">View all</Link>
            </div>
            {!orders?.length ? (
              <p className="mt-4 text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {orders.slice(0, 3).map((o) => (
                  <li key={o._id} className="flex justify-between py-4 text-sm">
                    <div>
                      <p className="font-medium">{o.orderNumber}</p>
                      <p className="text-muted-foreground">{ORDER_STATUS_LABELS[o.orderStatus]}</p>
                    </div>
                    <p className="tabular-nums">{formatPrice(o.total)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
