
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { productApi } from "@/lib/api";
import { formatPrice, effectivePrice } from "@/lib/types";

export default function AdminProducts() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await productApi.list({ limit: 50 })).data.data,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Product deleted"); },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Products</h1>
        <p className="text-sm text-muted-foreground">Use API or seed script to add products</p>
      </div>
      {isLoading ? (
        <div className="mt-8 animate-pulse space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-muted" />)}</div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="pb-3">Product</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]?.url} alt="" className="h-10 w-8 object-cover" />
                      {p.name}
                    </div>
                  </td>
                  <td className="py-3 font-mono text-xs">{p.sku}</td>
                  <td className="py-3 tabular-nums">{formatPrice(effectivePrice(p))}</td>
                  <td className="py-3">{p.stock}</td>
                  <td className="py-3">
                    <button onClick={() => deleteMut.mutate(p._id)} className="text-xs text-brand-primary hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
