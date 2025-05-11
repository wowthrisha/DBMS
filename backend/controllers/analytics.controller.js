import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async () => {
	try {
		const totalUsers = await User.countDocuments();
		const totalProducts = await Product.countDocuments();

		const salesData = await Order.aggregate([
			{
				$group: {
					_id: null,
					totalSales: { $sum: 1 },
					totalRevenue: { $sum: "$totalAmount" },
				},
			},
		]);

		// Handle case when there are no orders
		const { totalSales = 0, totalRevenue = 0 } = salesData[0] || {};

		// Get current stock levels
		const stockData = await Product.aggregate([
			{
				$group: {
					_id: null,
					totalStock: { $sum: "$stock" },
				},
			},
		]);

		const totalStock = stockData[0]?.totalStock || 0;

		return {
			users: totalUsers,
			products: totalProducts,
			totalSales,
			totalRevenue,
			totalStock,
		};
	} catch (error) {
		console.error("Error in getAnalyticsData:", error);
		throw error;
	}
};

export const getDailySalesData = async (startDate, endDate) => {
	try {
		// Convert string dates to Date objects and handle timezone
		const start = new Date(startDate);
		const end = new Date(endDate);
		
		// Set time to start and end of day in UTC
		start.setUTCHours(0, 0, 0, 0);
		end.setUTCHours(23, 59, 59, 999);

		console.log("Fetching sales data from", start.toISOString(), "to", end.toISOString());

		const dailySalesData = await Order.aggregate([
			{
				$match: {
					createdAt: {
						$gte: start,
						$lte: end,
					},
				},
			},
			{
				$group: {
					_id: {
						$dateToString: {
							format: "%Y-%m-%d",
							date: "$createdAt",
						}
					},
					sales: { $sum: 1 },
					revenue: { $sum: "$totalAmount" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		console.log("Found sales data:", dailySalesData);

		// Generate array of all dates in range
		const dateArray = getDatesInRange(start, end);
		console.log("Date array:", dateArray);

		// Map the data to include all dates, even those with no sales
		const result = dateArray.map((date) => {
			const foundData = dailySalesData.find((item) => item._id === date);
			return {
				date,
				sales: foundData?.sales || 0,
				revenue: foundData?.revenue || 0,
			};
		});

		console.log("Final result:", result);
		return result;
	} catch (error) {
		console.error("Error in getDailySalesData:", error);
		throw error;
	}
};

function getDatesInRange(startDate, endDate) {
	const dates = [];
	let currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		dates.push(currentDate.toISOString().split("T")[0]);
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}