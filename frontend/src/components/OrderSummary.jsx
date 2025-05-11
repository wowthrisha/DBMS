import { useCartStore } from "../stores/useCartStore";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import toast from "react-hot-toast";
import { useEffect } from "react";

const OrderSummary = () => {
	const { cart, subtotal, total, getCartItems, clearCart } = useCartStore();
	const { user, isLoading: authLoading, checkAuth } = useAuthStore();
	const navigate = useNavigate();

	useEffect(() => {
		getCartItems();
		checkAuth(); // Check auth state when component mounts
	}, [getCartItems, checkAuth]);

	const shippingCost = subtotal < 500 ? 50 : 0;
	const gstRate = 0.18; // 18% GST
	const gstAmount = subtotal * gstRate;
	const finalTotal = subtotal + shippingCost + gstAmount;

	const handleCheckout = async () => {
		if (authLoading) {
			toast.loading("Please wait...");
			return;
		}

		// Check auth state again before proceeding
		await checkAuth();

		if (!user) {
			toast.error("Please login to continue");
			navigate("/login", { state: { from: "/cart" } });
			return;
		}

		if (!cart || cart.length === 0) {
			toast.error("Your cart is empty");
			return;
		}

		try {
			const orderData = {
				products: cart.map(item => ({
					product: item.product._id,
					quantity: item.quantity,
					price: item.product.price
				})),
				totalAmount: finalTotal
			};

			const response = await fetch("/api/orders", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify(orderData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create order");
			}

			await clearCart(); // Clear the cart after successful order
			toast.success("Order placed successfully!");
			navigate("/purchase-success", { 
				state: { 
					orderId: data._id,
					order: {
						totalAmount: data.totalAmount,
						products: data.products
					}
				} 
			});
		} catch (error) {
			console.error("Error creating order:", error);
			toast.error(error.message || "Failed to place order. Please try again.");
		}
	};

	if (!cart || cart.length === 0) {
		return (
			<div className="bg-gray-800 p-6 rounded-lg shadow-lg">
				<h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
				<p className="text-gray-400">Your cart is empty</p>
			</div>
		);
	}

	return (
		<div className="bg-gray-800 p-6 rounded-lg shadow-lg">
			<h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
			
			{/* Item-wise breakdown */}
			<div className="space-y-2 mb-4">
				{cart.map((item) => (
					<div key={item.product._id} className="flex justify-between text-gray-300">
						<span>{item.product.name} x {item.quantity}</span>
						<span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
					</div>
				))}
			</div>

			<div className="space-y-2 border-t border-gray-700 pt-4">
				<div className="flex justify-between text-gray-300">
					<span>Subtotal</span>
					<span>₹{subtotal.toFixed(2)}</span>
				</div>
				<div className="flex justify-between text-gray-300">
					<span>Shipping</span>
					<span>{shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : "Free"}</span>
				</div>
				<div className="flex justify-between text-gray-300">
					<span>GST (18%)</span>
					<span>₹{gstAmount.toFixed(2)}</span>
				</div>
				<div className="flex justify-between text-white font-semibold text-lg border-t border-gray-700 pt-2 mt-2">
					<span>Total</span>
					<span>₹{finalTotal.toFixed(2)}</span>
				</div>
			</div>

			{shippingCost > 0 && (
				<p className="text-sm text-gray-400 mt-2">
					* Shipping charges apply for orders under ₹500
				</p>
			)}

			<button
				onClick={handleCheckout}
				disabled={!cart || cart.length === 0 || authLoading}
				className="w-full bg-emerald-500 text-white py-3 px-6 rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
			>
				Proceed to Checkout
			</button>
		</div>
	);
};

export default OrderSummary;