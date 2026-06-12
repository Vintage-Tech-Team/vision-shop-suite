import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const rating = stats[0]?.avgRating ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const reviewsCount = stats[0]?.count || 0;

  await Product.findByIdAndUpdate(productId, { rating, reviewsCount });
};

export const getProductReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(20, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return sendError(res, "Product not found", 404);

  const [reviews, total] = await Promise.all([
    Review.find({ product: product._id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ product: product._id }),
  ]);

  sendSuccess(res, { reviews, pagination: { page, limit, total } });
});

export const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return sendError(res, "Product not found", 404);

  const existing = await Review.findOne({ user: req.user._id, product: product._id });
  if (existing) return sendError(res, "You already reviewed this product", 400);

  const review = await Review.create({
    user: req.user._id,
    product: product._id,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  await updateProductRating(product._id);
  await review.populate("user", "name avatar");

  sendSuccess(res, review, "Review submitted", 201);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return sendError(res, "Review not found", 404);
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return sendError(res, "Not authorized", 403);
  }

  const productId = review.product;
  await review.deleteOne();
  await updateProductRating(productId);

  sendSuccess(res, null, "Review deleted");
});
