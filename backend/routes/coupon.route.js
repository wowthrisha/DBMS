import express from "express";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";
import {
	getCoupons,
	createCoupon,
	validateCoupon,
	deleteCoupon,
} from "../controllers/coupon.controller.js";

const router = express.Router();

// Public routes
router.get("/", getCoupons);
router.get("/validate/:code", validateCoupon);

// Admin only routes
router.post("/", protectRoute, adminOnly, createCoupon);
router.delete("/:id", protectRoute, adminOnly, deleteCoupon);

export default router;