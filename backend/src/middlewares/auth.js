import jwt from "jsonwebtoken";
import { sendError } from "../utils/apiResponse.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) return sendError(res, "Not authorized", 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return sendError(res, "User not found", 401);
    if (user.isBlocked) return sendError(res, "Account blocked", 403);

    req.user = user;
    next();
  } catch {
    return sendError(res, "Not authorized", 401);
  }
};

export const admin = (req, res, next) => {
  if (req.user?.role !== "admin") return sendError(res, "Admin access required", 403);
  next();
};

export const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const sendTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
