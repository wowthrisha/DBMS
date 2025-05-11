import express from "express";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";
import {
    createOrder,
    getUserOrders,
    getAllOrders,
    getOrderById
} from "../controllers/order.controller.js";

const router = express.Router();

// Admin only routes
router.get("/all", protectRoute, adminOnly, getAllOrders);

// Protected routes (authenticated users)
router.post("/", protectRoute, createOrder);
router.get("/my-orders", protectRoute, getUserOrders);
router.get("/:id", protectRoute, getOrderById);

export default router; 