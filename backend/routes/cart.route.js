import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

//import { addToCart } from "../controllers/cart.controller.js";
import { getAllProducts } from "../controllers/product.controller.js";
const router = express.Router();
router.get("/",protectRoute,getAllProducts);
//router.post("/",protectRoute,addToCart);
//router.delete("/",protectRoute,removeAllFromCart);
//router.put("/:id",protectRoute,updateQuantity);

export default router;