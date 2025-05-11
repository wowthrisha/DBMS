import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
    console.log('Cart route accessed:', req.method, req.path);
    next();
});

// All cart routes require authentication
router.use(protectRoute);

// Get cart
router.get("/", getCart);

// Add item to cart
router.post("/add", addToCart);

// Update cart item quantity
router.put("/item/:productId", updateCartItem);

// Remove item from cart
router.delete("/item/:productId", removeFromCart);

// Clear cart
router.delete("/clear", clearCart);

export default router;