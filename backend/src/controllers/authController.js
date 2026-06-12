import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { signToken, sendTokenCookie } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  addresses: user.addresses,
  wishlist: user.wishlist,
  createdAt: user.createdAt,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return sendError(res, "Email already registered", 400);

  const user = await User.create({ name, email, phone, password });
  const token = signToken(user._id);
  sendTokenCookie(res, token);

  sendSuccess(res, { user: sanitizeUser(user), token }, "Registration successful", 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return sendError(res, "Invalid email or password", 401);
  }
  if (user.isBlocked) return sendError(res, "Account blocked", 403);

  const token = signToken(user._id);
  sendTokenCookie(res, token);

  sendSuccess(res, { user: sanitizeUser(user), token }, "Login successful");
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { googleId, email, name, avatar } = req.body;
  if (!googleId || !email) return sendError(res, "Google credentials required", 400);

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      if (avatar) user.avatar = avatar;
      await user.save();
    }
  } else {
    user = await User.create({ name, email, googleId, avatar });
  }

  if (user.isBlocked) return sendError(res, "Account blocked", 403);

  const token = signToken(user._id);
  sendTokenCookie(res, token);

  sendSuccess(res, { user: sanitizeUser(user), token }, "Google login successful");
});

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, sanitizeUser(req.user));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, avatar },
    { new: true, runValidators: true },
  );
  sendSuccess(res, sanitizeUser(user), "Profile updated");
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }
  user.addresses.push(req.body);
  await user.save();
  sendSuccess(res, sanitizeUser(user), "Address added", 201);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.addressId);
  if (!addr) return sendError(res, "Address not found", 404);

  Object.assign(addr, req.body);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => { if (!a._id.equals(addr._id)) a.isDefault = false; });
  }
  await user.save();
  sendSuccess(res, sanitizeUser(user), "Address updated");
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.pull(req.params.addressId);
  await user.save();
  sendSuccess(res, sanitizeUser(user), "Address removed");
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("token");
  sendSuccess(res, null, "Logged out");
});
