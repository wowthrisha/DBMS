import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

export const createOrder = async (req, res) => {
    try {
        const { products, totalAmount } = req.body;
        const userId = req.user._id;
        const userName = req.user.name;
        const userEmail = req.user.email;

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Invalid products data" });
        }

        // Validate products and check stock
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.product} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }
        }

        // Create order with a unique stripeSessionId
        const order = await Order.create({
            user: userId,
            userName,
            userEmail,
            products,
            totalAmount,
            stripeSessionId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Generate a unique ID
        });

        // Update product stock
        for (const item of products) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear user's cart
        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } }
        );

        res.status(201).json(order);
    } catch (error) {
        console.error("Error in createOrder:", error);
        if (error.code === 11000) {
            return res.status(400).json({ error: "Order creation failed due to duplicate data" });
        }
        res.status(500).json({ error: "Error creating order" });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await Order.find({ user: userId })
            .populate("products.product")
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error in getUserOrders:", error);
        res.status(500).json({ error: "Error fetching orders" });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("products.product")
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error in getAllOrders:", error);
        res.status(500).json({ error: "Error fetching orders" });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id)
            .populate("user", "name email")
            .populate("products.product");

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Check if user is authorized to view this order
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ error: "Not authorized to view this order" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Error in getOrderById:", error);
        res.status(500).json({ error: "Error fetching order" });
    }
}; 