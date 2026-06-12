import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuth((s) => s.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const res = await authApi.login(data);
      setAuth(res.data.data.user, res.data.data.token);
      toast.success("Login successful!");
      navigate(searchParams.get("redirect") || (res.data.data.user.role === "admin" ? "/admin" : "/account"));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Login failed");
    }
  };

  const handleGoogle = () => {
    toast.info("Configure VITE_GOOGLE_CLIENT_ID for Google Sign-In");
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-5xl">Sign In</h1>
      <p className="mt-2 text-muted-foreground">Welcome back to Stitch Makers</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
          <input {...register("email")} type="email" className="mt-2 w-full border border-border bg-background p-3 text-sm outline-none focus:border-brand-primary" />
          {errors.email && <p className="mt-1 text-xs text-brand-primary">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Password</label>
          <input {...register("password")} type="password" className="mt-2 w-full border border-border bg-background p-3 text-sm outline-none focus:border-brand-primary" />
          {errors.password && <p className="mt-1 text-xs text-brand-primary">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-primary py-3.5 text-sm uppercase tracking-widest text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-background px-4 text-muted-foreground">Or</span></div>
      </div>

      <button onClick={handleGoogle} className="w-full border border-border py-3.5 text-sm uppercase tracking-widest hover:bg-muted">
        Continue with Google
      </button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="border-b border-foreground text-foreground">Create one</Link>
      </p>
    </section>
  );
}
