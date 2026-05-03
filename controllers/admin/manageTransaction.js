const { default: mongoose } = require("mongoose");
const Account = require("../../models/Account");
const Transaction = require("../../models/Transaction");
const User = require("../../models/User");

const getAllTransactions = async (req, res) => {
  try {
    const sort = { createdAt: -1 };

    const transactions = await Transaction.find().sort(sort).lean();
    res.status(200).json({
      data: transactions,
      success: true,
      message: "Account transactions fetched succesfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      success: false,
    });
  }
};

const createNewTransaction = async (req, res) => {
  const { description, amount, type, date, time, status, userId, accountId } =
    req.body;

  const role = req.role;

  if (!role || role !== "admin")
    return res.status(403).json({ message: "Forbidden!" });

  if (!accountId || !description || !amount || !type || !date || !userId) {
    return res.status(400).json({ message: "Invalid transaction data!" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found!" });
    }

    const userAccts = await Account.find({ userId });
    const depositAccount = userAccts.find(
      (acct) => acct._id.toString() === accountId,
    );

    if (!depositAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Account not found!" });
    }

    const parsedAmount = parseFloat(amount);
    const transactionStatus = status || "completed";

    if (type === "deposit") {
      depositAccount.balance.total += parsedAmount;
      depositAccount.balance.available += parsedAmount;
    } else if (type === "withdraw") {
      if (depositAccount.balance.available < parsedAmount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Insufficient balance!" });
      }
      depositAccount.balance.total -= parsedAmount;
      depositAccount.balance.available -= parsedAmount;
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Invalid transaction type! Must be deposit or withdraw",
      });
    }

    await depositAccount.save({ session });

    const newTransaction = {
      accountId: depositAccount._id,
      amount: parsedAmount,
      description: description,
      date: date,
      type: type,
      userId: user._id,
      balance: depositAccount.balance.available,
      time: time,
      status: transactionStatus,
    };

    await Transaction.create([newTransaction], { session });

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: "Transaction created!", data: null, success: true });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: error.message,
      data: null,
      success: false,
    });
  }
};

async function editTransaction(req, res) {
  const { transactionId } = req.params;
  const { status } = req.body;

  const role = req.role;

  if (!role || role !== "admin")
    return res.status(403).json({ message: "Forbidden!" });

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found!" });
    }

    if (status && status === "failed") {
      const account = await Account.findById(transaction.accountId);

      if (!account) {
        return res.status(404).json({ message: "Account not found!" });
      }

      const processReversal = async (type) => {
        switch (type) {
          case "withdraw":
            account.balance.total += transaction.amount;
            account.balance.available += transaction.amount;
            await account.save();
            break;
          case "deposit":
            account.balance.total -= transaction.amount;
            account.balance.available -= transaction.amount;
            await account.save();
            break;
          case "transfer":
            account.balance.total += transaction.amount;
            account.balance.available += transaction.amount;
            await account.save();
            break;
          default:
            throw new Error(`Unknown transaction type: ${type}`);
        }
      };

      await processReversal(transaction.type);

      transaction.status = status;
      transaction.balance = account.balance.available;
      await transaction.save();
    } else if (status) {
      transaction.status = status;
      await transaction.save();
    }

    res.status(200).json({
      message: "Transaction updated successfully.",
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Edit transaction error:", error);
    res.status(500).json({
      message: error.message,
      success: false,
      data: null,
    });
  }
}

async function deleteTransaction(req, res) {
  const { transactionId } = req.params;
  const userId = req.userId;
  const userRole = req.role;

  if (!transactionId) {
    return res.status(400).json({
      message: "Bad request! Transaction ID required",
      data: null,
      success: false,
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction =
      await Transaction.findById(transactionId).session(session);

    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "Transaction not found!",
        data: null,
        success: false,
      });
    }

    if (userRole !== "admin") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: "Forbidden!",
        data: null,
        success: false,
      });
    }

    if (transaction.status === "failed") {
      await Transaction.findByIdAndDelete(transaction._id).session(session);
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Failed transaction removed successfully",
        data: null,
        success: true,
      });
    }

    if (transaction.status === "completed") {
      const account = await Account.findById(transaction.accountId).session(
        session,
      );

      if (!account) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          message: "Associated account not found!",
          data: null,
          success: false,
        });
      }

      if (transaction.type === "deposit") {
        const newTotal = account.balance.total - transaction.amount;
        const newAvailable = account.balance.available - transaction.amount;

        if (newTotal < 0 || newAvailable < 0) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: "Cannot delete deposit: Would result in negative balance",
            data: null,
            success: false,
          });
        }

        account.balance.total = newTotal;
        account.balance.available = newAvailable;
      } else if (transaction.type === "withdraw") {
        account.balance.total += transaction.amount;
        account.balance.available += transaction.amount;
      } else if (transaction.type === "transfer") {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message:
            "Cannot delete transfer transactions directly. Please use the transfer reversal endpoint.",
          data: null,
          success: false,
        });
      }

      await account.save({ session });

      await Transaction.findByIdAndDelete(transaction._id).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Transaction deleted successfully",
      data: null,
      success: true,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Delete transaction error:", error);
    res.status(500).json({
      message: error.message,
      data: null,
      success: false,
    });
  }
}

module.exports = {
  editTransaction,
  createNewTransaction,
  getAllTransactions,
  deleteTransaction,
};
