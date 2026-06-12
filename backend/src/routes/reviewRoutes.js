import { Router } from "express";
import { body } from "express-validator";
import * as review from "../controllers/reviewController.js";
import { protect, admin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

router.get("/:slug", review.getProductReviews);

router.post(
  "/:slug",
  protect,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5"),
    body("comment").trim().notEmpty().withMessage("Comment required"),
  ],
  validate,
  review.createReview,
);

router.delete("/:id", protect, review.deleteReview);

export default router;
