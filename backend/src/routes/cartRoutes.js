import { Router } from "express";
import * as cart from "../controllers/cartController.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

router.use(protect);

router.get("/", cart.getCart);
router.post("/", cart.addToCart);
router.put("/:itemId", cart.updateCartItem);
router.delete("/:itemId", cart.removeFromCart);
router.delete("/", cart.clearCart);

export default router;
