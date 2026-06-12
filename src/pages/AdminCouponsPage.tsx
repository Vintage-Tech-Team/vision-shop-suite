
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { couponApi } from "@/lib/api";

export default function AdminCoupons() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    code: "", description: "", discountType: "percentage" as "percentage" | "fixed", discountValue: 10,
    minOrderAmount: 0, expiryDate: "", usageLimit: 100,
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => (await couponApi.list()).data.data,
  });

  const createMut = useMutation({
    mutationFn: () => couponApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-coupons"] }); toast.success("Coupon created"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => couponApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-coupons"] }); toast.success("Coupon deleted"); },
  });

  return (
    <div>
      <h1 className="font-display text-4xl">Coupons</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }}
        className="mt-8 grid gap-4 border border-border p-6 sm:grid-cols-2"
      >
        <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="field-input" required />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="field-input" />
        <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as "percentage" | "fixed" })} className="field-input">
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
        <input type="number" placeholder="Discount Value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} className="field-input" />
        <input type="number" placeholder="Min Order" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} className="field-input" />
        <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="field-input" required />
        <input type="number" placeholder="Usage Limit" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} className="field-input" />
        <button type="submit" className="btn-primary sm:col-span-2">Create Coupon</button>
      </form>

      <div className="mt-8 space-y-3">
        {coupons.map((c) => (
          <div key={c._id} className="flex items-center justify-between border border-border p-4">
            <div>
              <p className="font-mono font-medium">{c.code}</p>
              <p className="text-sm text-muted-foreground">
                {c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue}`} off · Expires {new Date(c.expiryDate).toLocaleDateString()}
              </p>
            </div>
            <button onClick={() => deleteMut.mutate(c._id)} className="text-xs text-brand-primary">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
