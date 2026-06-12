import { Router } from "express";
import express from "express";
import * as payment from "../controllers/paymentController.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

router.post("/stripe/intent", protect, payment.createStripeIntent);
router.post("/stripe/confirm", protect, payment.confirmStripePayment);
router.post("/stripe/webhook", express.raw({ type: "application/json" }), payment.stripeWebhook);

export default router;
