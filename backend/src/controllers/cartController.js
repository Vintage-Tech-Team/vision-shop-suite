import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const populateCart = { path: "items.product", select: "name slug price salePrice images stock sizes colors brand" };

export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(populateCart);
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  sendSuccess(res, cart);
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, size, color } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) return sendError(res, "Product not found", 404);
  if (product.stock < quantity) return sendError(res, "Insufficient stock", 400);

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const idx = cart.items.findIndex(
    (i) => i.product.toString() === productId && i.size === size && i.color === color,
  );

  if (idx >= 0) cart.items[idx].quantity += quantity;
  else cart.items.push({ product: productId, quantity, size, color });

  await cart.save();
  await cart.populate(populateCart);
  sendSuccess(res, cart, "Added to cart");
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return sendError(res, "Cart not found", 404);

  const item = cart.items.id(req.params.itemId);
  if (!item) return sendError(res, "Item not found", 404);

  if (req.body.quantity <= 0) item.deleteOne();
  else item.quantity = req.body.quantity;

  await cart.save();
  await cart.populate(populateCart);
  sendSuccess(res, cart, "Cart updated");
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return sendError(res, "Cart not found", 404);

  cart.items.pull(req.params.itemId);
  await cart.save();
  await cart.populate(populateCart);
  sendSuccess(res, cart, "Item removed");
});

export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  sendSuccess(res, { items: [] }, "Cart cleared");
});
