import Coupon from "../models/Coupon.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) return sendError(res, "Invalid coupon code", 404);
  if (new Date(coupon.expiryDate) < new Date()) return sendError(res, "Coupon expired", 400);
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return sendError(res, "Coupon usage limit reached", 400);
  }
  if (subtotal < coupon.minOrderAmount) {
    return sendError(res, `Minimum order amount is $${coupon.minOrderAmount}`, 400);
  }

  let discount =
    coupon.discountType === "percentage"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal);

  sendSuccess(res, { coupon, discount });
});

export const getCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  sendSuccess(res, coupons);
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, code: req.body.code.toUpperCase() });
  sendSuccess(res, coupon, "Coupon created", 201);
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) return sendError(res, "Coupon not found", 404);
  sendSuccess(res, coupon, "Coupon updated");
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return sendError(res, "Coupon not found", 404);
  sendSuccess(res, null, "Coupon deleted");
});
