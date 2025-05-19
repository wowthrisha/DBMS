import { BarChart, PlusCircle, ShoppingBasket, FileText, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import CashierView from "../components/CashierView";
import { useProductStore } from "../stores/useProductStore";

const tabs = [
	{ id: "create", label: "Create Product", icon: PlusCircle },
	{ id: "products", label: "Products", icon: ShoppingBasket },
	{ id: "analytics", label: "Analytics", icon: BarChart },
	{ id: "cashier", label: "User Bill", icon: FileText },
];

const AdminPage = () => {
	const [activeTab, setActiveTab] = useState("create");
	const { products, loading, fetchAllProducts } = useProductStore();

	useEffect(() => {
		fetchAllProducts();
	}, [fetchAllProducts]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader className="w-8 h-8 animate-spin text-emerald-500" />
			</div>
		);
	}

	return (
		<div className="min-h-screen relative overflow-hidden">
			<div className="relative z-10 container mx-auto px-4 py-16">
				<motion.h1
					className="text-4xl font-bold mb-8 text-emerald-400 text-center"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					Admin Dashboard
				</motion.h1>

				<div className="flex justify-center mb-8 flex-wrap gap-4">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
								activeTab === tab.id
									? "bg-emerald-600 text-white"
									: "bg-gray-700 text-gray-300 hover:bg-gray-600"
							}`}
						>
							<tab.icon className="mr-2 h-5 w-5" />
							{tab.label}
						</button>
					))}
				</div>

				{/* Render Tab Content */}
				{activeTab === "create" && <CreateProductForm />}
				{activeTab === "products" && <ProductsList products={products} />}
				{activeTab === "analytics" && <AnalyticsTab />}
				{activeTab === "cashier" && <CashierView />}
			</div>
		</div>
	);
};

export default AdminPage;