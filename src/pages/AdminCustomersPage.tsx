
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { adminApi } from "@/lib/api";

export default function AdminCustomers() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => (await adminApi.customers()).data.data,
  });

  const blockMut = useMutation({
    mutationFn: (id: string) => adminApi.toggleBlock(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-customers"] }); toast.success("Customer updated"); },
  });

  return (
    <div>
      <h1 className="font-display text-4xl">Customers</h1>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-widest text-muted-foreground">
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Joined</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.customers?.map((c) => (
              <tr key={c._id} className="border-b">
                <td className="py-3">{c.name}</td>
                <td className="py-3">{c.email}</td>
                <td className="py-3">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                <td className="py-3">{c.isBlocked ? <span className="text-brand-primary">Blocked</span> : "Active"}</td>
                <td className="py-3">
                  <button onClick={() => blockMut.mutate(c._id)} className="text-xs underline">
                    {c.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
