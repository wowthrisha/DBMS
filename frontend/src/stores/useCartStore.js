import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
	cart: [],
	coupon: null,
	total: 0,
	subtotal: 0,
	isCouponApplied: false,

	getMyCoupon: async () => {
		try {
			const response = await axios.get("/coupons");
			set({ coupon: response.data });
		} catch (error) {
			console.error("Error fetching coupon:", error);
		}
	},
	applyCoupon: async (code) => {
		try {
			// Clean the coupon code by removing any special characters and converting to uppercase
			const cleanCode = code.split(':')[0].trim().toUpperCase();
			const response = await axios.get(`/coupons/validate/${encodeURIComponent(cleanCode)}`);
			set({ coupon: response.data, isCouponApplied: true });
			get().calculateTotals();
			toast.success("Coupon applied successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to apply coupon");
		}
	},
	removeCoupon: () => {
		set({ coupon: null, isCouponApplied: false });
		get().calculateTotals();
		toast.success("Coupon removed");
	},

	getCartItems: async () => {
		try {
			const res = await axios.get("/cart");
			set({ cart: res.data.items || [] });
			get().calculateTotals();
		} catch (error) {
			set({ cart: [] });
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},
	clearCart: async () => {
		try {
			await axios.delete("/cart/clear");
		set({ cart: [], coupon: null, total: 0, subtotal: 0 });
			toast.success("Cart cleared successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to clear cart");
		}
	},
	addToCart: async (product) => {
		try {
			const response = await axios.post("/cart/add", { productId: product._id });
			toast.success("Product added to cart");

			// Update cart with the response from server
			set({ cart: response.data.items || [] });
			get().calculateTotals();
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},
	removeFromCart: async (productId) => {
		try {
			await axios.delete(`/cart/item/${productId}`);
			set((prevState) => ({ cart: prevState.cart.filter((item) => item.product._id !== productId) }));
		get().calculateTotals();
			toast.success("Product removed from cart");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to remove product");
		}
	},
	updateQuantity: async (productId, quantity) => {
		try {
			if (quantity <= 0) {
				await get().removeFromCart(productId);
			return;
		}

			const response = await axios.put(`/cart/item/${productId}`, { quantity });
			set({ cart: response.data.items || [] });
		get().calculateTotals();
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update quantity");
		}
	},
	calculateTotals: () => {
		const { cart, coupon } = get();
		const subtotal = cart.reduce((sum, item) => 
			sum + (item.product?.price || 0) * item.quantity, 0
		);
		let total = subtotal;

		if (coupon) {
			const discount = subtotal * (coupon.discount / 100);
			total = subtotal - discount;
		}

		set({ subtotal, total });
	},
}));       