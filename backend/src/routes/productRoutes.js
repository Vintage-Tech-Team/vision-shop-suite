import { Router } from "express";
import * as product from "../controllers/productController.js";
import { protect, admin } from "../middlewares/auth.js";
import { uploadMultiple } from "../middlewares/upload.js";

const router = Router();

router.get("/", product.getProducts);
router.get("/search", product.searchProducts);
router.get("/home", product.getHomeSections);
router.get("/:slug", product.getProduct);

router.post("/", protect, admin, uploadMultiple, product.createProduct);
router.put("/:id", protect, admin, uploadMultiple, product.updateProduct);
router.delete("/:id", protect, admin, product.deleteProduct);
router.post("/bulk", protect, admin, product.bulkUploadProducts);
router.patch("/:id/stock", protect, admin, product.updateStock);
router.delete("/:id/images/:publicId", protect, admin, product.deleteProductImage);

export default router;
