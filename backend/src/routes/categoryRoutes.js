import { Router } from "express";
import * as category from "../controllers/categoryController.js";
import { protect, admin } from "../middlewares/auth.js";
import { uploadSingle } from "../middlewares/upload.js";

const router = Router();

router.get("/", category.getCategories);
router.get("/flat", category.getFlatCategories);
router.get("/:slug", category.getCategory);

router.post("/", protect, admin, uploadSingle, category.createCategory);
router.put("/:id", protect, admin, uploadSingle, category.updateCategory);
router.delete("/:id", protect, admin, category.deleteCategory);

export default router;
