import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const adminData = {
            name: "Admin User",
            email: "admin@example.com",
            password: "admin123",
            role: "admin"
        };

        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log("Admin user already exists");
            process.exit(0);
        }

        const admin = await User.create(adminData);
        console.log("Admin user created successfully:", admin.email);
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin(); 