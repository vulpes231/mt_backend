const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

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
  const username = req.user;
  try {
    const user = await User.findOne({ username: username });

    const userTransactions = await Transaction.find({ receiver: user._id });

    userTransactions.sort((a, b) => a.date === b.date);
    res.status(200).json({ userTransactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: err.message });
  }
};

const createNewTransaction = async (req, res) => {
  const { accountNumber, description, amount, type, date, time, username } =
    req.body;

  if (!accountNumber || !description || !amount || !type || !date)
    return res.status(400).json({ message: "Invalid transaction data!" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "user not found" });

    const userAccount = await Account.findOne({ accountNo: accountNumber });
    if (!userAccount)
      return res.status(400).json({ message: "invalid account number" });

    userAccount.balance = userAccount.balance += parseFloat(amount);

    await userAccount.save();

    const newTransaction = {
      accountNo: accountNumber,
      amount: amount,
      description: description,
      date: date,
      type: type,
      receiver: user._id,
      balance: bal,
      time: time || null,
    };

    await Transaction.create(newTransaction);
    res.status(200).json({ message: "transaction created!" });
  } catch (error) {
    console.log(err);
    res.status(500).json({ message: "Error creating transaction!" });
  }
};

module.exports = {
  createNewTransaction,
  getUserTransactions,
  getAllTransactions,
};
