import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { couponApi, orderApi, paymentApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useCart } from "@/lib/store";
import { formatPrice } from "@/lib/types";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

const STEPS = ["Address", "Shipping", "Payment", "Confirmation"];

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    fullName: "", phone: "", street: "", city: "", state: "", zipCode: "", country: "United States",
  });
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">("cod");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<{ orderNumber: string; total: number } | null>(null);

  const { items } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: shipping } = useQuery({
    queryKey: ["shipping", shippingMethod],
    queryFn: async () => (await orderApi.estimateShipping(shippingMethod)).data.data.cost,
  });

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);
  const shippingCost = shipping ?? 9.99;
  const total = Math.max(0, subtotal + shippingCost - discount);

  const createOrderMut = useMutation({
    mutationFn: async () => {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        quantity: i.qty,
        size: i.size,
        color: i.color,
      }));

      const res = await orderApi.create({
        shippingAddress: address,
        paymentMethod,
        shippingMethod,
        couponCode: couponCode || undefined,
        items: orderItems,
      });
      return res.data.data;
    },
    onSuccess: async (order) => {
      setOrderId(order._id);
      if (paymentMethod === "stripe") {
        const intent = await paymentApi.createIntent(order._id);
        setClientSecret(intent.data.data.clientSecret);
        setStep(2);
      } else {
        setCompletedOrder({ orderNumber: order.orderNumber, total: order.total });
        setStep(3);
        toast.success("Order placed successfully!");
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to place order");
    },
  });

  const applyCoupon = async () => {
    try {
      const res = await couponApi.validate(couponCode, subtotal);
      setDiscount(res.data.data.discount);
      toast.success(`Coupon applied: -${formatPrice(res.data.data.discount)}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Invalid coupon");
    }
  };

  if (!items.length && step < 3) {
    return (
      <section className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="font-display text-4xl">Your bag is empty</h1>
        <Link to="/shop" className="mt-6 inline-block btn-primary px-8">Continue Shopping</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-5xl">Checkout</h1>

      {/* Step indicator */}
      <div className="mt-8 flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 border-b-2 pb-2 text-center text-xs uppercase tracking-widest ${i <= step ? "border-brand-primary text-brand-primary" : "border-border text-muted-foreground"}`}>
            {s}
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl">Shipping Address</h2>
              {user?.addresses?.length ? (
                <div className="space-y-2">
                  {user.addresses.map((a) => (
                    <button
                      key={a._id}
                      onClick={() => setAddress({ ...a, country: a.country || "United States" })}
                      className="w-full border border-border p-4 text-left text-sm hover:border-brand-primary"
                    >
                      {a.fullName} — {a.street}, {a.city}
                    </button>
                  ))}
                </div>
              ) : null}
              {(["fullName", "phone", "street", "city", "state", "zipCode"] as const).map((field) => (
                <input
                  key={field}
                  placeholder={field.replace(/([A-Z])/g, " $1")}
                  value={address[field]}
                  onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                  className="field-input"
                />
              ))}
              <button onClick={() => setStep(1)} className="btn-primary w-full">Continue to Shipping</button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl">Shipping Method</h2>
              {(["standard", "express"] as const).map((m) => (
                <label key={m} className={`flex cursor-pointer items-center justify-between border p-4 ${shippingMethod === m ? "border-brand-primary" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={shippingMethod === m} onChange={() => setShippingMethod(m)} />
                    <span className="capitalize">{m} Shipping</span>
                  </div>
                  <span>{formatPrice(m === "standard" ? 9.99 : 19.99)}</span>
                </label>
              ))}

              <h2 className="font-display text-2xl pt-4">Payment Method</h2>
              <label className={`flex cursor-pointer items-center gap-3 border p-4 ${paymentMethod === "cod" ? "border-brand-primary" : "border-border"}`}>
                <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                Cash on Delivery
              </label>
              <label className={`flex cursor-pointer items-center gap-3 border p-4 ${paymentMethod === "stripe" ? "border-brand-primary" : "border-border"}`}>
                <input type="radio" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} />
                Credit / Debit Card (Stripe)
              </label>

              <div className="flex gap-4">
                <button onClick={() => setStep(0)} className="flex-1 border border-border py-3 text-sm uppercase tracking-widest">Back</button>
                <button onClick={() => createOrderMut.mutate()} disabled={createOrderMut.isPending} className="btn-primary flex-1">
                  {createOrderMut.isPending ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          )}

          {step === 2 && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripeForm
                onSuccess={(orderNumber, total) => {
                  setCompletedOrder({ orderNumber, total });
                  setStep(3);
                  toast.success("Payment successful!");
                }}
              />
            </Elements>
          )}

          {step === 3 && completedOrder && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">✓</div>
              <h2 className="mt-6 font-display text-3xl">Order Confirmed!</h2>
              <p className="mt-2 text-muted-foreground">Order #{completedOrder.orderNumber}</p>
              <p className="mt-1 text-lg tabular-nums">{formatPrice(completedOrder.total)}</p>
              <Link to="/account/orders" className="mt-8 inline-block btn-primary px-8">View Orders</Link>
            </div>
          )}
        </div>

        <aside className="h-fit border border-border p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Order Summary</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(shippingCost)}</span></div>
            {discount > 0 && <div className="flex justify-between text-brand-primary"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between border-t border-border pt-2 font-medium"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          {step < 2 && (
            <div className="mt-4 flex gap-2">
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className="field-input flex-1" />
              <button onClick={applyCoupon} className="border border-border px-4 text-xs uppercase">Apply</button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function StripeForm({ onSuccess }: { onSuccess: (orderNumber: string, total: number) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: "if_required" });
    if (error) {
      toast.error(error.message || "Payment failed");
      setLoading(false);
      return;
    }
    if (paymentIntent?.status === "succeeded") {
      await paymentApi.confirm(paymentIntent.id);
      onSuccess(paymentIntent.id.slice(-8).toUpperCase(), paymentIntent.amount / 100);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl">Payment</h2>
      <PaymentElement />
      <button onClick={handlePay} disabled={loading || !stripe} className="btn-primary w-full">
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}
