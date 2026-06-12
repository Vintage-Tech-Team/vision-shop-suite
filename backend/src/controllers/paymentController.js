import Order from "../models/Order.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createPaymentIntent, confirmPaymentIntent } from "../services/stripeService.js";

export const createStripeIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) return sendError(res, "Order not found", 404);
  if (order.paymentMethod !== "stripe") return sendError(res, "Order is not a Stripe payment", 400);

  const intent = await createPaymentIntent({
    amount: order.total,
    metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
  });

  order.stripePaymentIntentId = intent.id;
  await order.save();

  sendSuccess(res, { clientSecret: intent.client_secret, paymentIntentId: intent.id });
});

export const confirmStripePayment = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;
  const intent = await confirmPaymentIntent(paymentIntentId);

  const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
  if (!order) return sendError(res, "Order not found", 404);

  if (intent.status === "succeeded") {
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    await order.save();
    sendSuccess(res, order, "Payment successful");
  } else {
    order.paymentStatus = "failed";
    await order.save();
    sendError(res, "Payment failed", 400);
  }
});

export const stripeWebhook = asyncHandler(async (req, res) => {
  const stripe = (await import("../config/stripe.js")).getStripe();
  if (!stripe) return sendError(res, "Stripe not configured", 500);

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return sendError(res, `Webhook error: ${err.message}`, 400);
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    await Order.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      { paymentStatus: "paid", orderStatus: "confirmed" },
    );
  }

  sendSuccess(res, { received: true });
});
