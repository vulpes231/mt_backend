const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  receiver: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
