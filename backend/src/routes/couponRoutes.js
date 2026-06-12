import { Router } from "express";
import { body } from "express-validator";
import * as coupon from "../controllers/couponController.js";
import { protect, admin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

router.post(
  "/validate",
  protect,
  [
    body("code").notEmpty().withMessage("Coupon code required"),
    body("subtotal").isNumeric().withMessage("Subtotal required"),
  ],
  validate,
  coupon.validateCoupon,
);

router.get("/", protect, admin, coupon.getCoupons);
router.post("/", protect, admin, coupon.createCoupon);
router.put("/:id", protect, admin, coupon.updateCoupon);
router.delete("/:id", protect, admin, coupon.deleteCoupon);

export default router;
