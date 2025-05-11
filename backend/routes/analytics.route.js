import express from "express";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";
import { getAnalyticsData, getDailySalesData } from "../controllers/analytics.controller.js";

const router = express.Router();

// Get overall analytics data
router.get("/", protectRoute, adminOnly, async (req, res) => {
	try {
		const analyticsData = await getAnalyticsData();
		res.json(analyticsData);
	} catch (error) {
		console.error("Error fetching analytics:", error);
		res.status(500).json({ message: "Error fetching analytics data" });
	}
});

// Get daily sales data
router.get("/daily-sales", protectRoute, adminOnly, async (req, res) => {
	try {
		const { startDate, endDate } = req.query;
		if (!startDate || !endDate) {
			return res.status(400).json({ message: "Start date and end date are required" });
		}
		const dailySalesData = await getDailySalesData(new Date(startDate), new Date(endDate));
		res.json(dailySalesData);
	} catch (error) {
		console.error("Error fetching daily sales:", error);
		res.status(500).json({ message: "Error fetching daily sales data" });
	}
});

export default router;