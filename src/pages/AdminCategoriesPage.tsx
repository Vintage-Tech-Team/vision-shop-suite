
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api";
import type { Category } from "@/lib/types";

export default function AdminCategories() {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await categoryApi.tree()).data.data,
  });

  return (
    <div>
      <h1 className="font-display text-4xl">Categories</h1>
      <p className="mt-2 text-muted-foreground">3-level hierarchy: Category → Subcategory → Child Category</p>
      <div className="mt-8 space-y-6">
        {categories.map((cat) => (
          <CategoryNode key={cat._id} category={cat} depth={0} />
        ))}
      </div>
    </div>
  );
}

function CategoryNode({ category, depth }: { category: Category; depth: number }) {
  return (
    <div style={{ marginLeft: depth * 24 }}>
      <div className="flex items-center gap-3 border border-border p-3">
        {category.image && <img src={category.image} alt="" className="h-10 w-10 object-cover" />}
        <div>
          <p className="font-medium">{category.name}</p>
          <p className="text-xs text-muted-foreground">Level {category.level} · {category.slug}</p>
        </div>
      </div>
      {category.children?.map((child) => (
        <CategoryNode key={child._id} category={child} depth={depth + 1} />
      ))}
    </div>
  );
}
