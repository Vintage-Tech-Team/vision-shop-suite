import { Router } from "express";
import * as wishlist from "../controllers/wishlistController.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

router.use(protect);

router.get("/", wishlist.getWishlist);
router.post("/toggle", wishlist.toggleWishlist);
router.delete("/:productId", wishlist.removeFromWishlist);

export default router;
