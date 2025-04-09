const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const mongoose = require("mongoose");

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json({ transactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: err.message });
  }
};

const getUserTransactions = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the transactions and sort by createdAt in descending order
    const userTransactions = await Transaction.find({
      receiver: user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ userTransactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const createNewTransaction = async (req, res) => {
  const {
    accountNumber,
    description,
    amount,
    type,
    date,
    time,
    username,
    status,
  } = req.body;

  console.log(req.body);
  if (!accountNumber || !description || !amount || !type || !date) {
    return res.status(400).json({ message: "Invalid transaction data!" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ username }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    const userAccount = await Account.findOne({
      accountNo: accountNumber,
    }).session(session);
    if (!userAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid account number" });
    }

    const parsedAmount = parseFloat(amount);
    if (type == "credit") {
      userAccount.balance = userAccount.balance += parsedAmount;
    } else if (type == "debit") {
      userAccount.balance = userAccount.balance -= parsedAmount;
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    await userAccount.save({ session });

    const newTransaction = {
      accountNo: accountNumber,
      amount: parsedAmount,
      description: description,
      date: date,
      type: type,
      receiver: user._id,
      balance: userAccount.balance,
      time: time || null,
      status: status || "completed",
    };

    await Transaction.create([newTransaction], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Transaction created!" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    res.status(500).json({ message: "Error creating transaction!" });
  }
};

const getAccountTransaction = async (req, res) => {
  const userId = req.userId;
  if (!userId)
    return res.status(401).json({ message: "You're not logged in." });
  const { accountNo } = req.params;
  try {
    const trnxs = await Transaction.find({ accountNo: accountNo });
    res.status(200).json({ trnxs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNewTransaction,
  getUserTransactions,
  getAllTransactions,
  getAccountTransaction,
};
