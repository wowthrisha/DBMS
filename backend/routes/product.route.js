import express from "express";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";
import {
    getAllProducts,
    getFeaturedProducts,
    createProduct,
    deleteProduct,
    getProductsByCategory,
    toggleFeaturedProduct,
    getProductById,
    getRecommendations,
    updateQuantity,
} from "../controllers/product.controller.js";
import upload from "../lib/multer.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/recommendations", getRecommendations);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);

// Protected routes (admin only)
router.post("/", protectRoute, adminOnly, upload.single("image"), createProduct);
router.delete("/:id", protectRoute, adminOnly, deleteProduct);
router.patch("/:id/featured", protectRoute, adminOnly, toggleFeaturedProduct);
router.patch("/:id/quantity", protectRoute, adminOnly, updateQuantity);

export default router;