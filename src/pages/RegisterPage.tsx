import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuth((s) => s.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const res = await authApi.register(data);
      setAuth(res.data.data.user, res.data.data.token);
      toast.success("Account created successfully!");
      navigate("/account" );
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Registration failed");
    }
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-5xl">Create Account</h1>
      <p className="mt-2 text-muted-foreground">Join Stitch Makers today</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
        <Field label="Full Name" error={errors.name?.message}>
          <input {...register("name")} className="field-input" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input {...register("email")} type="email" className="field-input" />
        </Field>
        <Field label="Phone (optional)" error={errors.phone?.message}>
          <input {...register("phone")} type="tel" className="field-input" />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input {...register("password")} type="password" className="field-input" />
        </Field>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="border-b border-foreground">Sign in</Link>
      </p>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1 text-xs text-brand-primary">{error}</p>}
    </div>
  );
}
