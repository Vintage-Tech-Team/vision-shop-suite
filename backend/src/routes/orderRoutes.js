import { Router } from "express";
import * as order from "../controllers/orderController.js";
import { protect, admin } from "../middlewares/auth.js";

const router = Router();

router.get("/shipping/estimate", order.estimateShipping);

router.use(protect);

router.post("/", order.createOrder);
router.get("/my", order.getMyOrders);
router.get("/track/:orderNumber", order.trackOrder);
router.get("/:id/invoice", order.downloadInvoice);
router.get("/:id", order.getOrder);
router.patch("/:id/cancel", order.cancelOrder);

router.get("/", admin, order.getAllOrders);
router.patch("/:id/status", admin, order.updateOrderStatus);
router.post("/:id/refund", admin, order.refundOrder);

export default router;
