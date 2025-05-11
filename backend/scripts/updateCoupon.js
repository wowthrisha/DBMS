import mongoose from "mongoose";
import dotenv from "dotenv";
import Coupon from "../models/coupon.model.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '../../.env') });

const updateCoupon = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI environment variable is not set");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Update coupon expiry date
        const result = await Coupon.updateOne(
            { code: "WELCOME20" },
            { $set: { expiryDate: new Date("2024-05-31T23:59:59Z") } }
        );

        if (result.matchedCount === 0) {
            console.log("Coupon not found");
        } else if (result.modifiedCount === 0) {
            console.log("Coupon found but no changes were needed");
        } else {
            console.log("Coupon expiry date updated successfully");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error updating coupon:", error);
        process.exit(1);
    }
};

updateCoupon(); 