import { Link } from "react-router-dom";
import { Heart, Moon, ShoppingBag, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { SearchBar } from "@/components/SearchBar";
import { useAuth } from "@/lib/auth-store";
import { useCart, useTheme, useWishlist } from "@/lib/store";

export function Header() {
  const cartCount = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));
  const wishCount = useWishlist((s) => s.slugs.length);
  const { theme, toggle } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-80">
          <Logo className="h-11 w-11 shrink-0" />
          <span className="hidden font-display text-xl md:inline">Stitch Makers</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm lg:flex">
          <Link to="/shop" className="transition-opacity hover:opacity-60">Shop</Link>
          <Link to="/shop?newArrival=true" className="transition-opacity hover:opacity-60">New In</Link>
          <Link to="/shop?trending=true" className="transition-opacity hover:opacity-60">Trending</Link>
          <Link to="/shop?featured=true" className="transition-opacity hover:opacity-60">Sale</Link>
        </nav>

        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar />
        </div>

        <div className="flex items-center gap-1">
          <button
            aria-label="Toggle theme"
            onClick={toggle}
            className="rounded-full p-2 transition-colors hover:bg-muted"
          >
            {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="group relative">
              <button className="rounded-full p-2 transition-colors hover:bg-muted">
                <User className="h-4 w-4" />
              </button>
              <div className="invisible absolute right-0 top-full z-50 mt-1 w-48 border border-border bg-background py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                <p className="px-4 py-1 text-xs text-muted-foreground">Hi, {user.name.split(" ")[0]}</p>
                <Link to="/account" className="block px-4 py-2 text-sm hover:bg-muted">My Account</Link>
                <Link to="/account/orders" className="block px-4 py-2 text-sm hover:bg-muted">Orders</Link>
                {isAdmin() && (
                  <Link to="/admin" className="block px-4 py-2 text-sm text-brand-primary hover:bg-muted">Admin</Link>
                )}
                <button onClick={() => logout()} className="block w-full px-4 py-2 text-left text-sm hover:bg-muted">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="hidden px-3 py-2 text-xs uppercase tracking-widest sm:block">
              Sign In
            </Link>
          )}

          <Link to="/wishlist" className="relative rounded-full p-2 transition-colors hover:bg-muted">
            <Heart className="h-4 w-4" />
            {wishCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-medium text-white">
                {wishCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative rounded-full p-2 transition-colors hover:bg-muted">
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-medium text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div className="border-t border-border px-6 py-2 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
