import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Tags, Users, Ticket } from "lucide-react";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
];

export function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10">
      <aside className="hidden w-56 shrink-0 lg:block">
        <h2 className="font-display text-2xl text-brand-primary">Admin</h2>
        <nav className="mt-6 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-muted ${isActive ? "bg-brand-primary text-white" : ""}`
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="mt-8 block text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          ← Back to Store
        </Link>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
