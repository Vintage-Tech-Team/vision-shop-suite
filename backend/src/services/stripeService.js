import { getStripe } from "../config/stripe.js";

export const createPaymentIntent = async ({ amount, currency = "usd", metadata = {} }) => {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");

  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
};

export const confirmPaymentIntent = async (paymentIntentId) => {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");
  return stripe.paymentIntents.retrieve(paymentIntentId);
};

export const refundPayment = async (paymentIntentId, amount) => {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  });
};
