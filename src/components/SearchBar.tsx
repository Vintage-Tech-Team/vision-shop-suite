import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { productApi } from "@/lib/api";
import { Link } from "react-router-dom";
import { productUrl, shopUrl } from "@/lib/shop-search";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);
  const ref = useRef<HTMLDivElement>(null);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["search", debounced],
    queryFn: async () => {
      if (debounced.length < 2) return [];
      const { data } = await productApi.search(debounced);
      return data.data;
    },
    enabled: debounced.length >= 2,
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center border border-border bg-background">
        <Search className="ml-3 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full bg-transparent px-3 py-2 text-sm outline-none md:w-64"
        />
        {query && (
          <button onClick={() => setQuery("")} className="p-2">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {open && debounced.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto border border-border bg-background shadow-lg">
          {suggestions.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No results for &ldquo;{debounced}&rdquo;</p>
          ) : (
            <>
              {suggestions.map((p) => (
                <Link
                  key={p._id}
                  to={productUrl(p.slug)}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 border-b border-border p-3 transition-colors hover:bg-muted"
                >
                  <img
                    src={p.images?.[0]?.url}
                    alt={p.name}
                    className="h-12 w-10 object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                  </div>
                </Link>
              ))}
              <Link
                to={shopUrl({ search: debounced })}
                onClick={() => setOpen(false)}
                className="block p-3 text-center text-xs uppercase tracking-widest text-brand-primary hover:underline"
              >
                View all results →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
