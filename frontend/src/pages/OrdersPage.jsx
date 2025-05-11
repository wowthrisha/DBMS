import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Loader } from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get("/orders/my-orders");
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast.error("Failed to fetch orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-900 py-12">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4">No Orders Yet</h1>
                        <p className="text-gray-300 mb-8">
                            You haven't placed any orders yet. Start shopping to see your orders here.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="bg-emerald-500 text-white py-3 px-6 rounded-md hover:bg-emerald-600 transition-colors"
                        >
                            Start Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">
                                            Order #{order._id.slice(-6).toUpperCase()}
                                        </h2>
                                        <p className="text-gray-400 text-sm">
                                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            By: {order.userName} ({order.userEmail})
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-emerald-400">
                                            ₹{order.totalAmount.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-400">Total Amount</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-700 pt-4">
                                    <h3 className="text-white font-medium mb-3">Ordered Items:</h3>
                                    <div className="space-y-3">
                                        {order.products.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center text-gray-300">
                                                <div>
                                                    <p className="font-medium">{item.product.name}</p>
                                                    <p className="text-sm text-gray-400">
                                                        Quantity: {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="font-medium">
                                                    ₹{(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage; 