const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const transactionSchema = new Schema(
	{
		receiver: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		accountNo: {
			type: Number,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
		},
		date: {
			type: String,
			required: true,
		},
		time: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "completed", "failed"],
			default: "pending",
		},
		type: {
			type: String,
			enum: ["credit", "debit", "transfer"],
			required: true,
		},
		balance: {
			type: Number,
		},
		createdAt: {
			type: Date,
			default: Date.now,
			index: -1, // Descending index for latest first sorting
		},
	},
	{ timestamps: true }
);

// Compound index for better query performance when sorting by createdAt
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
