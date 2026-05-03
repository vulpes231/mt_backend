const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
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
      default: "completed",
    },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "transfer"],
      required: true,
    },
    balance: {
      type: Number,
    },
    reference: { type: String },
  },
  { timestamps: true },
);

transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
