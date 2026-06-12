import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import type { Address } from "@/lib/types";

export default function Addresses() {
  const { user, fetchMe } = useAuth();
  const { register, handleSubmit, reset } = useForm<Address>();

  const onSubmit = async (data: Address) => {
    try {
      await authApi.addAddress(data);
      await fetchMe();
      reset();
      toast.success("Address added");
    } catch {
      toast.error("Failed to add address");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await authApi.deleteAddress(id);
      await fetchMe();
      toast.success("Address removed");
    } catch {
      toast.error("Failed to remove address");
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <Link to="/account" className="text-xs uppercase tracking-widest text-muted-foreground">← Account</Link>
      <h1 className="mt-4 font-display text-5xl">Addresses</h1>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl">Saved Addresses</h2>
          {!user?.addresses?.length ? (
            <p className="mt-4 text-muted-foreground">No addresses saved.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {user.addresses.map((addr) => (
                <li key={addr._id} className="border border-border p-4 text-sm">
                  <p className="font-medium">{addr.fullName}</p>
                  <p className="text-muted-foreground">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                  <p className="text-muted-foreground">{addr.phone}</p>
                  {addr.isDefault && <span className="mt-2 inline-block text-xs uppercase text-brand-primary">Default</span>}
                  <button onClick={() => addr._id && handleDelete(addr._id)} className="mt-2 block text-xs text-muted-foreground hover:text-brand-primary">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="font-display text-2xl">Add Address</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <input {...register("fullName", { required: true })} placeholder="Full Name" className="field-input" />
            <input {...register("phone", { required: true })} placeholder="Phone" className="field-input" />
            <input {...register("street", { required: true })} placeholder="Street Address" className="field-input" />
            <div className="grid grid-cols-2 gap-4">
              <input {...register("city", { required: true })} placeholder="City" className="field-input" />
              <input {...register("state", { required: true })} placeholder="State" className="field-input" />
            </div>
            <input {...register("zipCode", { required: true })} placeholder="ZIP Code" className="field-input" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("isDefault")} /> Set as default
            </label>
            <button type="submit" className="btn-primary w-full">Save Address</button>
          </form>
        </div>
      </div>
    </section>
  );
}
