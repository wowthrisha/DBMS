import express from "express";
import { getAllProducts,getFeaturedProducts,createProduct,deleteProduct,getProductsByCategory,toggleFeaturedProduct } from "../controllers/product.controller.js";
import { protectRoute,adminRoute } from "../middleware/auth.middleware.js";
const router = express.Router();
router.get("/",protectRoute,adminRoute,getAllProducts);
router.get("/featured",getFeaturedProducts);//subroute
router.get("/category/:category",getProductsByCategory);//category and category name
router.post("/",protectRoute,adminRoute,createProduct);
router.patch("/:id",protectRoute,adminRoute,toggleFeaturedProduct);
router.delete("/:id",protectRoute,adminRoute,deleteProduct);
export default router;