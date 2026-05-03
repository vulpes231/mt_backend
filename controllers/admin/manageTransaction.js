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

    const userAccts = await Account.find({ owner: user._id });

    const userAccount = userAccts.find(
      (acct) => acct._id.toString() === accountId,
    );

    if (!userAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Account not found!" });
    }

    const parsedAmount = parseFloat(amount);
    if (type == "credit") {
      userAccount.balance += parsedAmount;
    } else if (type == "debit") {
      userAccount.balance -= parsedAmount;
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    await userAccount.save({ session });

    const newTransaction = {
      accountNo: userAccount.accountNo,
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
      const account = await Account.findOne({
        accountNo: transaction.accountNo,
      });

      if (!account) {
        return res.status(404).json({ message: "Account not found!" });
      }

      const processReversal = async (type) => {
        switch (type) {
          case "debit":
            account.balance += transaction.amount;
            await account.save();
            break;
          case "credit":
            account.balance -= transaction.amount;
            await account.save();
            break;
          case "transfer":
            account.balance += transaction.amount;
            await account.save();
            break;
          default:
            throw new Error(`Unknown transaction type: ${type}`);
        }
      };

      await processReversal(transaction.type);

      transaction.status = status;
      transaction.balance = account.balance;
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

module.exports = { editTransaction, createNewTransaction, getAllTransactions };
