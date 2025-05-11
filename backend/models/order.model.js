import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		userName: {
			type: String,
			required: true,
		},
		userEmail: {
			type: String,
			required: true,
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				price: {
					type: Number,
					required: true,
					min: 0,
				},
			},
		],
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		stripeSessionId: {
			type: String,
			required: false,
			index: true
		},
	},
	{ timestamps: true }
);

orderSchema.index({ stripeSessionId: 1 }, { unique: false });

const Order = mongoose.model("Order", orderSchema);

Order.collection.dropIndexes()
	.then(() => {
		console.log("Successfully dropped all indexes");
		return Order.collection.createIndex({ stripeSessionId: 1 }, { unique: false });
	})
	.then(() => {
		console.log("Successfully created new index");
	})
	.catch(err => {
		console.error("Error managing indexes:", err);
	});

export default Order;