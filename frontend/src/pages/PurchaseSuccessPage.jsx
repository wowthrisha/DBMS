import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { CheckCircle, Package, ArrowLeft } from "lucide-react";

const PurchaseSuccessPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { orderId, order } = location.state || {};

	useEffect(() => {
		if (!orderId) {
			toast.error("Invalid order information");
			navigate("/");
		}
	}, [orderId, navigate]);

	if (!orderId) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-900 py-12">
			<div className="max-w-3xl mx-auto px-4">
				<div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
					<div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<CheckCircle className="w-8 h-8 text-emerald-500" />
					</div>
					
					<h1 className="text-3xl font-bold text-white mb-4">
						Order Placed Successfully!
					</h1>
					
					<p className="text-gray-300 mb-8">
						Thank you for your purchase. Your order has been confirmed.
					</p>

					<div className="bg-gray-700 rounded-lg p-6 mb-8">
						<h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-center">
							<Package className="mr-2" size={20} />
							Order Details
						</h2>
						<div className="space-y-2 text-left">
							<p className="text-gray-300">
								Order ID: <span className="font-medium text-white">{orderId}</span>
							</p>
							<p className="text-gray-300">
								Total Amount: <span className="font-medium text-white">₹{order?.totalAmount?.toFixed(2)}</span>
							</p>
							<p className="text-gray-300">
								Status: <span className="font-medium text-emerald-400">Processing</span>
							</p>
							
							{order?.products && (
								<div className="mt-4">
									<h3 className="text-white font-medium mb-2">Ordered Items:</h3>
									<div className="space-y-2">
										{order.products.map((item, index) => (
											<div key={index} className="flex justify-between text-gray-300">
												<span>{item.product.name} x {item.quantity}</span>
												<span>₹{(item.price * item.quantity).toFixed(2)}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="space-y-4">
						<button
							onClick={() => navigate("/orders")}
							className="w-full bg-emerald-500 text-white py-3 px-6 rounded-md hover:bg-emerald-600 transition-colors"
						>
							View All Orders
						</button>
						<button
							onClick={() => navigate("/")}
							className="w-full bg-gray-700 text-gray-300 py-3 px-6 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"
						>
							<ArrowLeft className="mr-2" size={18} />
							Continue Shopping
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PurchaseSuccessPage;