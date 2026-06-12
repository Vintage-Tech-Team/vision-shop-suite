import { Router } from "express";
import * as admin from "../controllers/adminController.js";
import { protect, admin as adminOnly } from "../middlewares/auth.js";

const router = Router();

router.use(protect, adminOnly);

router.get("/dashboard", admin.getDashboardStats);
router.get("/revenue-chart", admin.getRevenueChart);
router.get("/customers", admin.getCustomers);
router.get("/customers/:id/orders", admin.getCustomerHistory);
router.patch("/customers/:id/block", admin.toggleBlockCustomer);

export default router;
