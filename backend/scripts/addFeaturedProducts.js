import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '../../.env') });

const addFeaturedProducts = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI environment variable is not set");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Create three featured products
        const products = [
            {
                name: "Premium Leather Jacket",
                description: "High-quality leather jacket with modern design and comfortable fit",
                price: 4999,
                image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000",
                category: "jackets",
                countInStock: 10,
                featured: true
            },
            {
                name: "Classic Denim Jeans",
                description: "Stylish and durable denim jeans perfect for everyday wear",
                price: 1999,
                image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000",
                category: "jeans",
                countInStock: 15,
                featured: true
            },
            {
                name: "Designer Sunglasses",
                description: "Trendy sunglasses with UV protection and polarized lenses",
                price: 1499,
                image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000",
                category: "glasses",
                countInStock: 20,
                featured: true
            }
        ];

        // Create products
        for (const productData of products) {
            const existingProduct = await Product.findOne({ name: productData.name });
            if (!existingProduct) {
                const product = await Product.create(productData);
                console.log(`Created product: ${product.name}`);
            } else {
                console.log(`Product already exists: ${productData.name}`);
            }
        }

        // Create coupon
        const couponData = {
            code: "WELCOME20",
            discount: 20,
            expiryDate: new Date("2024-12-31"),
            isActive: true
        };

        const existingCoupon = await Coupon.findOne({ code: couponData.code });
        if (!existingCoupon) {
            const coupon = await Coupon.create(couponData);
            console.log(`Created coupon: ${coupon.code}`);
        } else {
            console.log(`Coupon already exists: ${couponData.code}`);
        }

        console.log("All items added successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error adding items:", error);
        process.exit(1);
    }
};

addFeaturedProducts(); 