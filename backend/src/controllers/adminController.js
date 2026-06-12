import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders,
    totalCustomers,
    totalProducts,
    revenueAgg,
    dailyRevenue,
    monthlyRevenue,
    bestSellers,
    topCategories,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments({ orderStatus: { $ne: "cancelled" } }),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments({ isActive: true }),
    Order.aggregate([
      { $match: { paymentStatus: { $in: ["paid", "pending"] }, orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          slug: "$product.slug",
          image: { $arrayElemAt: ["$product.images.url", 0] },
          totalSold: 1,
          revenue: 1,
        },
      },
    ]),
    Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $group: { _id: "$product.category", revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      { $project: { name: "$category.name", revenue: 1 } },
    ]),
    Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("orderNumber total orderStatus paymentStatus createdAt user"),
  ]);

  sendSuccess(res, {
    totalSales: revenueAgg[0]?.total || 0,
    dailySales: dailyRevenue[0]?.total || 0,
    monthlySales: monthlyRevenue[0]?.total || 0,
    totalOrders,
    totalCustomers,
    totalProducts,
    bestSellers,
    topCategories,
    recentOrders,
  });
});

export const getRevenueChart = asyncHandler(async (req, res) => {
  const days = Math.min(365, Number(req.query.days) || 30);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, orderStatus: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  sendSuccess(res, data);
});

export const getCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const [customers, total] = await Promise.all([
    User.find({ role: "customer" })
      .select("name email phone isBlocked createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments({ role: "customer" }),
  ]);

  sendSuccess(res, { customers, pagination: { page, limit, total } });
});

export const getCustomerHistory = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
  sendSuccess(res, orders);
});

export const toggleBlockCustomer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "customer") return sendSuccess(res, null, "Customer not found");

  user.isBlocked = !user.isBlocked;
  await user.save();
  sendSuccess(res, user, user.isBlocked ? "Customer blocked" : "Customer unblocked");
});
