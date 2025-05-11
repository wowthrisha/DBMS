import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const getCart = async (req, res) => {
	try {
		const cart = await Cart.findOne({ user: req.user._id })
			.populate('items.product', 'name price image');

		if (!cart) {
			return res.json({ items: [], total: 0 });
		}

		res.json(cart);
	} catch (error) {
		console.error("Error in getCart:", error);
		res.status(500).json({ message: "Error fetching cart" });
	}
};

export const addToCart = async (req, res) => {
	try {
		const { productId, quantity = 1 } = req.body;

		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		let cart = await Cart.findOne({ user: req.user._id });
		
		if (!cart) {
			cart = new Cart({ user: req.user._id, items: [] });
		}

		const existingItem = cart.items.find(item => 
			item.product.toString() === productId
		);

		if (existingItem) {
			existingItem.quantity += quantity;
		} else {
			cart.items.push({ product: productId, quantity });
		}

		await cart.save();
		await cart.populate('items.product', 'name price image');

		res.json(cart);
	} catch (error) {
		console.error("Error in addToCart:", error);
		res.status(500).json({ message: "Error adding to cart" });
	}
};

export const updateCartItem = async (req, res) => {
	try {
		const { productId } = req.params;
		const { quantity } = req.body;

		if (quantity < 0) {
			return res.status(400).json({ message: "Quantity cannot be negative" });
		}

		const cart = await Cart.findOne({ user: req.user._id });
		if (!cart) {
			return res.status(404).json({ message: "Cart not found" });
		}

		const item = cart.items.find(item => 
			item.product.toString() === productId
		);

		if (!item) {
			return res.status(404).json({ message: "Item not found in cart" });
		}

		if (quantity === 0) {
			cart.items = cart.items.filter(item => 
				item.product.toString() !== productId
			);
		} else {
			item.quantity = quantity;
		}

		await cart.save();
		await cart.populate('items.product', 'name price image');

		res.json(cart);
	} catch (error) {
		console.error("Error in updateCartItem:", error);
		res.status(500).json({ message: "Error updating cart" });
	}
};

export const removeFromCart = async (req, res) => {
	try {
		const { productId } = req.params;

		const cart = await Cart.findOne({ user: req.user._id });
		if (!cart) {
			return res.status(404).json({ message: "Cart not found" });
		}

		cart.items = cart.items.filter(item => 
			item.product.toString() !== productId
		);

		await cart.save();
		await cart.populate('items.product', 'name price image');

		res.json(cart);
	} catch (error) {
		console.error("Error in removeFromCart:", error);
		res.status(500).json({ message: "Error removing from cart" });
	}
};

export const clearCart = async (req, res) => {
	try {
		const cart = await Cart.findOne({ user: req.user._id });
		if (!cart) {
			return res.status(404).json({ message: "Cart not found" });
		}

		cart.items = [];
		await cart.save();

		res.json({ message: "Cart cleared successfully" });
	} catch (error) {
		console.error("Error in clearCart:", error);
		res.status(500).json({ message: "Error clearing cart" });
	}
};