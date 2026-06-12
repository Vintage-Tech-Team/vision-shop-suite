import User from "../models/User.js";
import Product from "../models/Product.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    select: "name slug price salePrice images rating brand stock",
  });
  sendSuccess(res, user.wishlist);
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) return sendError(res, "Product not found", 404);

  const user = await User.findById(req.user._id);
  const idx = user.wishlist.findIndex((id) => id.toString() === productId);

  if (idx >= 0) user.wishlist.splice(idx, 1);
  else user.wishlist.push(productId);

  await user.save();
  await user.populate({ path: "wishlist", select: "name slug price salePrice images rating brand" });

  sendSuccess(res, user.wishlist, idx >= 0 ? "Removed from wishlist" : "Added to wishlist");
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
  await user.save();
  sendSuccess(res, user.wishlist, "Removed from wishlist");
});
