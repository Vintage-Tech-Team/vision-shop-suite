import { Router } from "express";
import { body } from "express-validator";
import * as auth from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  auth.register,
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  auth.login,
);

router.post("/google", authLimiter, auth.googleLogin);
router.post("/logout", auth.logout);
router.get("/me", protect, auth.getMe);
router.put("/profile", protect, auth.updateProfile);
router.post("/addresses", protect, auth.addAddress);
router.put("/addresses/:addressId", protect, auth.updateAddress);
router.delete("/addresses/:addressId", protect, auth.deleteAddress);

export default router;
