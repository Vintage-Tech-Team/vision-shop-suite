import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateInvoicePDF } from "../services/invoiceService.js";
import { refundPayment } from "../services/stripeService.js";

const SHIPPING_RATES = { standard: 9.99, express: 19.99 };

const getEffectivePrice = (product) =>
  product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;

const calculateCouponDiscount = (coupon, subtotal) => {
  if (!coupon || !coupon.isActive || new Date(coupon.expiryDate) < new Date()) return 0;
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return 0;
  if (subtotal < coupon.minOrderAmount) return 0;

  let discount =
    coupon.discountType === "percentage"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  return Math.min(discount, subtotal);
};

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, shippingMethod = "standard", couponCode, items: guestItems } = req.body;

  let orderItems = [];

  if (guestItems?.length) {
    for (const item of guestItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return sendError(res, `Insufficient stock for ${product?.name || "product"}`, 400);
      }
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: getEffectivePrice(product),
        name: product.name,
        image: product.images?.[0]?.url,
      });
    }
  } else {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart?.items?.length) return sendError(res, "Cart is empty", 400);

    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return sendError(res, `Insufficient stock for ${product.name}`, 400);
      }
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: getEffectivePrice(product),
        name: product.name,
        image: product.images?.[0]?.url,
      });
    }
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = SHIPPING_RATES[shippingMethod] || SHIPPING_RATES.standard;

  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
  }
  const discount = calculateCouponDiscount(coupon, subtotal);
  const total = Math.max(0, subtotal + shippingCost - discount);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    subtotal,
    shippingCost,
    discount,
    total,
    coupon: coupon?._id,
    couponCode: coupon?.code,
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
    orderStatus: paymentMethod === "cod" ? "confirmed" : "pending",
  });

  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }

  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  if (!guestItems?.length) {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  }

  sendSuccess(res, order, "Order placed", 201);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(20, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("items.product", "name slug images"),
    Order.countDocuments(filter),
  ]);

  sendPaginated(res, orders, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    $or: [{ _id: req.params.id }, { orderNumber: req.params.id }],
    user: req.user._id,
  }).populate("items.product", "name slug images brand");

  if (!order) return sendError(res, "Order not found", 404);
  sendSuccess(res, order);
});

export const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber, user: req.user._id });
  if (!order) return sendError(res, "Order not found", 404);

  sendSuccess(res, {
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  sendPaginated(res, orders, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return sendError(res, "Order not found", 404);

  if (orderStatus) order.orderStatus = orderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;

  if (orderStatus === "delivered" && order.paymentMethod === "cod") {
    order.paymentStatus = "paid";
  }

  await order.save();
  sendSuccess(res, order, "Order status updated");
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return sendError(res, "Order not found", 404);

  const isOwner = order.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) return sendError(res, "Not authorized", 403);

  if (["shipped", "out_for_delivery", "delivered"].includes(order.orderStatus)) {
    return sendError(res, "Order cannot be cancelled at this stage", 400);
  }

  order.orderStatus = "cancelled";
  await order.save();

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  sendSuccess(res, order, "Order cancelled");
});

export const refundOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return sendError(res, "Order not found", 404);

  if (order.paymentMethod === "stripe" && order.stripePaymentIntentId) {
    await refundPayment(order.stripePaymentIntentId, order.total);
  }

  order.orderStatus = "refunded";
  order.paymentStatus = "refunded";
  await order.save();

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  sendSuccess(res, order, "Order refunded");
});

export const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) return sendError(res, "Order not found", 404);

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") return sendError(res, "Not authorized", 403);

  const pdf = await generateInvoicePDF(order, order.user);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.orderNumber}.pdf`);
  res.send(pdf);
});

export const estimateShipping = asyncHandler(async (req, res) => {
  const method = req.query.method || "standard";
  sendSuccess(res, { cost: SHIPPING_RATES[method] || SHIPPING_RATES.standard, method });
});
