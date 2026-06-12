
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { orderApi } from "@/lib/api";
import { ORDER_STATUS_LABELS, formatPrice } from "@/lib/types";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"];

export default function AdminOrders() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await orderApi.all()).data.data,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, orderStatus, trackingNumber }: { id: string; orderStatus?: string; trackingNumber?: string }) =>
      orderApi.updateStatus(id, { orderStatus, trackingNumber }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast.success("Order updated"); },
  });

  const refundMut = useMutation({
    mutationFn: (id: string) => orderApi.refund(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast.success("Order refunded"); },
  });

  const downloadInvoice = async (id: string, orderNumber: string) => {
    const res = await orderApi.invoice(id);
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${orderNumber}.pdf`;
    a.click();
  };

  return (
    <div>
      <h1 className="font-display text-4xl">Orders</h1>
      {isLoading ? (
        <div className="mt-8 animate-pulse space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-muted" />)}</div>
      ) : (
        <div className="mt-8 space-y-4">
          {data?.map((o) => (
            <div key={o._id} className="border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{typeof o.user === "object" ? o.user.name : ""} · {formatPrice(o.total)}</p>
                </div>
                <select
                  value={o.orderStatus}
                  onChange={(e) => updateMut.mutate({ id: o._id, orderStatus: e.target.value })}
                  className="border border-border px-3 py-1 text-sm"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <input
                  placeholder="Tracking number"
                  defaultValue={o.trackingNumber || ""}
                  onBlur={(e) => e.target.value && updateMut.mutate({ id: o._id, trackingNumber: e.target.value })}
                  className="field-input max-w-xs text-xs"
                />
                <button onClick={() => downloadInvoice(o._id, o.orderNumber)} className="text-xs uppercase tracking-widest underline">Download Invoice</button>
                <button onClick={() => refundMut.mutate(o._id)} className="text-xs uppercase tracking-widest text-brand-primary">Refund</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
