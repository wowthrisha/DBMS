// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Users, Package, ShoppingCart, DollarSign, Box } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AnalyticsTab = () => {
	const [analyticsData, setAnalyticsData] = useState({
		users: 0,
		products: 0,
		totalSales: 0,
		totalRevenue: 0,
		totalStock: 0
	});
	const [isLoading, setIsLoading] = useState(true);
	const [dailySalesData, setDailySalesData] = useState([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAnalyticsData = async () => {
			try {
				setError(null);
				const response = await axios.get("/analytics");
				setAnalyticsData(response.data);
				
				// Fetch daily sales data for the last 30 days
				const endDate = new Date();
				const startDate = new Date();
				startDate.setDate(startDate.getDate() - 30);

				// Ensure we capture the full day in UTC
				startDate.setUTCHours(0, 0, 0, 0);
				endDate.setUTCHours(23, 59, 59, 999);

				console.log("Fetching data from", startDate.toISOString(), "to", endDate.toISOString());
				
				const dailyResponse = await axios.get("/analytics/daily-sales", {
					params: {
						startDate: startDate.toISOString(),
						endDate: endDate.toISOString()
					}
				});
				
				if (dailyResponse.data && Array.isArray(dailyResponse.data)) {
					console.log("Received daily sales data:", dailyResponse.data);
					setDailySalesData(dailyResponse.data);
				} else {
					console.error("Invalid daily sales data format:", dailyResponse.data);
					setError("Failed to load sales data");
				}
			} catch (error) {
				console.error("Error fetching analytics data:", error);
				setError("Failed to load analytics data");
			} finally {
				setIsLoading(false);
			}
		};

		fetchAnalyticsData();
	}, []);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-red-500">{error}</div>
			</div>
		);
	}

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8'>
				<AnalyticsCard
					title='Total Users'
					value={analyticsData.users.toLocaleString()}
					icon={Users}
					color='from-emerald-500 to-teal-700'
				/>
				<AnalyticsCard
					title='Total Products'
					value={analyticsData.products.toLocaleString()}
					icon={Package}
					color='from-emerald-500 to-green-700'
				/>
				<AnalyticsCard
					title='Current Stock'
					value={analyticsData.totalStock.toLocaleString()}
					icon={Box}
					color='from-emerald-500 to-blue-700'
				/>
				<AnalyticsCard
					title='Total Sales'
					value={analyticsData.totalSales.toLocaleString()}
					icon={ShoppingCart}
					color='from-emerald-500 to-cyan-700'
				/>
				<AnalyticsCard
					title='Total Revenue'
					value={`₹${analyticsData.totalRevenue.toLocaleString()}`}
					icon={DollarSign}
					color='from-emerald-500 to-lime-700'
				/>
			</div>
			<motion.div
				className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.25 }}
			>
				<h3 className="text-xl font-semibold text-white mb-4">Sales Analytics (Last 30 Days)</h3>
				{dailySalesData.length > 0 ? (
				<ResponsiveContainer width='100%' height={400}>
					<LineChart data={dailySalesData}>
							<CartesianGrid strokeDasharray='3 3' stroke="#374151" />
							<XAxis 
								dataKey='date' 
								stroke='#D1D5DB'
								tick={{ fill: '#9CA3AF' }}
								tickFormatter={(date) => {
									const d = new Date(date);
									return d.toLocaleDateString('en-US', { 
										month: 'short', 
										day: 'numeric',
										timeZone: 'UTC'
									});
								}}
							/>
							<YAxis 
								yAxisId='left' 
								stroke='#D1D5DB'
								tick={{ fill: '#9CA3AF' }}
								label={{ value: 'Sales', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
							/>
							<YAxis 
								yAxisId='right' 
								orientation='right' 
								stroke='#D1D5DB'
								tick={{ fill: '#9CA3AF' }}
								label={{ value: 'Revenue (₹)', angle: 90, position: 'insideRight', fill: '#9CA3AF' }}
							/>
							<Tooltip 
								contentStyle={{ 
									backgroundColor: '#1F2937',
									border: 'none',
									borderRadius: '0.5rem',
									color: '#D1D5DB'
								}}
								formatter={(value, name) => [
									name === 'revenue' ? `₹${value.toLocaleString()}` : value.toLocaleString(),
									name === 'revenue' ? 'Revenue' : 'Sales'
								]}
								labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									timeZone: 'UTC'
								})}
							/>
						<Legend />
						<Line
							yAxisId='left'
							type='monotone'
							dataKey='sales'
							stroke='#10B981'
								strokeWidth={2}
							activeDot={{ r: 8 }}
							name='Sales'
						/>
						<Line
							yAxisId='right'
							type='monotone'
							dataKey='revenue'
							stroke='#3B82F6'
								strokeWidth={2}
							activeDot={{ r: 8 }}
							name='Revenue'
						/>
					</LineChart>
				</ResponsiveContainer>
				) : (
					<div className="flex items-center justify-center h-[400px] text-gray-400">
						No sales data available for the selected period
					</div>
				)}
			</motion.div>
		</div>
	);
};

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
	<motion.div
		className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative`}
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
	>
		<div className='flex justify-between items-center'>
			<div className='z-10'>
				<p className='text-emerald-300 text-sm mb-1 font-semibold'>{title}</p>
				<h3 className='text-white text-3xl font-bold'>{value}</h3>
			</div>
			<div className='z-10'>
				<Icon className='w-8 h-8 text-emerald-300' />
		</div>
			<div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
		</div>
	</motion.div>
);

export default AnalyticsTab;