import { Link } from "@tanstack/react-router";
import { Heart, Moon, ShoppingBag, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart, useTheme, useWishlist } from "@/lib/store";

export function Header() {
  const cartCount = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));
  const wishCount = useWishlist((s) => s.slugs.length);
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-2xl tracking-tight">
          ATLAS<span className="text-muted-foreground">.</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/shop" className="transition-opacity hover:opacity-60">Shop</Link>
          <Link to="/shop" search={{ c: "Sneakers" }} className="transition-opacity hover:opacity-60">Sneakers</Link>
          <Link to="/shop" search={{ c: "Outerwear" }} className="transition-opacity hover:opacity-60">Outerwear</Link>
          <Link to="/journal" className="transition-opacity hover:opacity-60">Journal</Link>
        </nav>
        <div className="flex items-center gap-1">
          <button
            aria-label="Toggle theme"
            onClick={toggle}
            className="rounded-full p-2 transition-colors hover:bg-muted"
          >
            {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/wishlist" className="relative rounded-full p-2 transition-colors hover:bg-muted">
            <Heart className="h-4 w-4" />
            {wishCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                {wishCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative rounded-full p-2 transition-colors hover:bg-muted">
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
