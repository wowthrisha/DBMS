import Coupon from "../models/coupon.model.js";

export const getCoupons = async (req, res) => {
	try {
		const coupons = await Coupon.find();
		res.status(200).json(coupons);
	} catch (error) {
		console.error("Error fetching coupons:", error);
		res.status(500).json({ message: "Error fetching coupons" });
	}
};

export const createCoupon = async (req, res) => {
	try {
		const { code, discount, expiryDate } = req.body;

		if (!code || !discount) {
			return res.status(400).json({ message: "Code and discount are required" });
		}

		const existingCoupon = await Coupon.findOne({ code });
		if (existingCoupon) {
			return res.status(400).json({ message: "Coupon code already exists" });
		}

		const coupon = await Coupon.create({
			code,
			discount,
			expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days expiry
		});

		res.status(201).json(coupon);
	} catch (error) {
		console.error("Error creating coupon:", error);
		res.status(500).json({ message: "Error creating coupon" });
	}
};

export const validateCoupon = async (req, res) => {
	try {
		const { code } = req.params;
		// Clean the coupon code by removing any special characters and converting to uppercase
		const cleanCode = code.split(':')[0].trim().toUpperCase();

		const coupon = await Coupon.findOne({ code: cleanCode });
		if (!coupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		if (coupon.expiryDate < new Date()) {
			return res.status(400).json({ message: "Coupon has expired" });
		}

		res.status(200).json(coupon);
	} catch (error) {
		console.error("Error validating coupon:", error);
		res.status(500).json({ message: "Error validating coupon" });
	}
};

export const deleteCoupon = async (req, res) => {
	try {
		const { id } = req.params;
		await Coupon.findByIdAndDelete(id);
		res.status(200).json({ message: "Coupon deleted successfully" });
	} catch (error) {
		console.error("Error deleting coupon:", error);
		res.status(500).json({ message: "Error deleting coupon" });
	}
};