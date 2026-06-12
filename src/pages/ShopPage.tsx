import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Grid3X3, List, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { categoryApi, productApi } from "@/lib/api";
import { useShopSearchParams, type ShopSearch } from "@/lib/shop-search";
import type { Product } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function Shop() {
  const { search, updateSearch } = useShopSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [infiniteScroll, setInfiniteScroll] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-flat"],
    queryFn: async () => (await categoryApi.flat()).data.data,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["products", search, infiniteScroll],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string | number> = { page: pageParam, limit: 12, ...search };
      const res = await productApi.list(params);
      return { products: res.data.data, pagination: res.data.pagination };
    },
    getNextPageParam: (last) =>
      last.pagination && last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  const products = data?.pages.flatMap((p) => p.products) ?? [];
  const total = data?.pages[0]?.pagination?.total ?? 0;

  return (
    <section className="mx-auto max-w-7xl px-6 pt-12 pb-16">
      <div className="border-b border-border pb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">The Collection</p>
        <h1 className="mt-3 font-display text-5xl md:text-7xl">Shop All</h1>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-widest"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>

        <select
          value={search.sort || ""}
          onChange={(e) => updateSearch({ sort: e.target.value || undefined })}
          className="border border-border bg-background px-4 py-2 text-xs uppercase tracking-widest"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "text-brand-primary" : ""}`}>
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "text-brand-primary" : ""}`}>
            <List className="h-4 w-4" />
          </button>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={infiniteScroll} onChange={(e) => setInfiniteScroll(e.target.checked)} />
            Infinite scroll
          </label>
          <span className="text-xs text-muted-foreground">{total} items</span>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-4">
        {showFilters && (
          <aside className="space-y-6 border border-border p-6 lg:col-span-1">
            <FilterGroup title="Category">
              <select
                value={search.category || ""}
                onChange={(e) => updateSearch({ category: e.target.value || undefined })}
                className="w-full border border-border bg-background p-2 text-sm"
              >
                <option value="">All Categories</option>
                {categories.filter((c) => c.level === 0).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </FilterGroup>
            <FilterGroup title="Brand">
              <input
                type="text"
                placeholder="Search brand..."
                value={search.brand || ""}
                onChange={(e) => updateSearch({ brand: e.target.value || undefined })}
                className="w-full border border-border bg-background p-2 text-sm"
              />
            </FilterGroup>
            <FilterGroup title="Price Range">
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={search.minPrice || ""} onChange={(e) => updateSearch({ minPrice: e.target.value || undefined })} className="w-full border border-border p-2 text-sm" />
                <input type="number" placeholder="Max" value={search.maxPrice || ""} onChange={(e) => updateSearch({ maxPrice: e.target.value || undefined })} className="w-full border border-border p-2 text-sm" />
              </div>
            </FilterGroup>
            <FilterGroup title="Size">
              <select value={search.size || ""} onChange={(e) => updateSearch({ size: e.target.value || undefined })} className="w-full border border-border p-2 text-sm">
                <option value="">Any Size</option>
                {["XS", "S", "M", "L", "XL", "28", "30", "32", "34"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FilterGroup>
            <FilterGroup title="Rating">
              <select value={search.rating || ""} onChange={(e) => updateSearch({ rating: e.target.value || undefined })} className="w-full border border-border p-2 text-sm">
                <option value="">Any Rating</option>
                {[4, 3, 2].map((r) => (
                  <option key={r} value={r}>{r}+ Stars</option>
                ))}
              </select>
            </FilterGroup>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={search.inStock === "true"} onChange={(e) => updateSearch({ inStock: e.target.checked ? "true" : undefined })} />
              In Stock Only
            </label>
          </aside>
        )}

        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse bg-muted" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">No products found.</p>
          ) : view === "grid" ? (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div>
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} listView />
              ))}
            </div>
          )}

          {!infiniteScroll && hasNextPage && (
            <div className="mt-12 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="border border-foreground px-8 py-3 text-sm uppercase tracking-widest hover:bg-foreground hover:text-background"
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </button>
            </div>
          )}

          {infiniteScroll && hasNextPage && (
            <InfiniteScrollTrigger onVisible={() => fetchNextPage()} loading={isFetchingNextPage} />
          )}
        </div>
      </div>
    </section>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function InfiniteScrollTrigger({ onVisible, loading }: { onVisible: () => void; loading: boolean }) {
  return (
    <div className="mt-8 text-center">
      <button onClick={onVisible} disabled={loading} className="text-sm text-muted-foreground">
        {loading ? "Loading more..." : "Scroll for more"}
      </button>
    </div>
  );
}
