const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const { format } = require("date-fns");
const mongoose = require("mongoose");

const transferMoney = async (req, res) => {
  const username = req.user;
  const { senderAccountId, receiverAccountId, amount, description, type } =
    req.body;

  console.log(req.body);

  if (!senderAccountId || !receiverAccountId || !amount || isNaN(amount)) {
    return res.status(400).json({ message: "Invalid transfer details" });
  }

  if (!type || !["internal", "external"].includes(type)) {
    return res.status(400).json({ message: "Invalid transfer type" });
  }

  if (senderAccountId === receiverAccountId && type === "internal") {
    return res.status(400).json({ message: "Cannot transfer to same account" });
  }

  const parsedAmount = parseFloat(amount);
  if (parsedAmount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const senderAccount =
      await Account.findById(senderAccountId).session(session);
    if (!senderAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Sender account not found" });
    }

    if (senderAccount.balance.available < parsedAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient funds!" });
    }

    let receiverAccount = null;
    let receiverUserId = null;

    if (type === "internal") {
      receiverAccount =
        await Account.findById(receiverAccountId).session(session);
      if (!receiverAccount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Receiver account not found" });
      }

      if (
        receiverAccount.status === "closed" ||
        receiverAccount.status === "frozen"
      ) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Receiver account is not active" });
      }

      receiverUserId = receiverAccount.userId;
    }

    senderAccount.balance.total -= parsedAmount;
    senderAccount.balance.available -= parsedAmount;
    await senderAccount.save({ session });

    if (type === "internal") {
      receiverAccount.balance.total += parsedAmount;
      receiverAccount.balance.available += parsedAmount;
      await receiverAccount.save({ session });
    }

    const now = new Date();
    const formattedTime = format(now, "hh:mm a");
    const formattedDate = format(now, "MMM dd, yyyy");

    const senderTransaction = new Transaction({
      accountId: senderAccount._id,
      amount: parsedAmount,
      description:
        description ||
        `Transfer to ${type === "internal" ? `account ${receiverAccount.accountNumber}` : "external account"}`,
      date: formattedDate,
      time: formattedTime,
      type: "withdraw",
      userId: senderAccount.userId,
      balance: senderAccount.balance.available,
      status: "pending",
      reference: `TXN_${Date.now()}_${senderAccount.userId}`,
    });

    await senderTransaction.save({ session });

    if (type === "internal") {
      const receiverTransaction = new Transaction({
        accountId: receiverAccount._id,
        amount: parsedAmount,
        description:
          description || `Transfer from account ${senderAccount.accountNumber}`,
        date: formattedDate,
        time: formattedTime,
        type: "deposit",
        userId: receiverAccount.userId,
        balance: receiverAccount.balance.available,
        status: "completed",
        reference: `TXN_${Date.now()}_${receiverAccount.userId}`,
      });

      await receiverTransaction.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    let successMessage = `$${parsedAmount} transferred successfully!`;
    if (type === "internal") {
      successMessage = `$${parsedAmount} sent to account ${receiverAccount.accountNumber} successfully!`;
    } else {
      successMessage = `$${parsedAmount} sent to external account successfully!`;
    }

    res.status(201).json({
      success: true,
      message: successMessage,
      data: {
        senderBalance: senderAccount.balance.available,
        amountTransferred: parsedAmount,
        transactionId: senderTransaction._id,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transfer error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = { transferMoney };
