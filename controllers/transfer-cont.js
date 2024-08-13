const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const { format } = require("date-fns");

const transferMoney = async (req, res) => {
  const username = req.user;
  const { fromAccount, toAccount, amount, description } = req.body;

  if (!fromAccount || !toAccount || !amount || isNaN(amount))
    return res.status(400).json({ message: "Invalid transfer details" });

  try {
    const senderAccount = await Account.findOne({ accountNo: fromAccount });
    if (!senderAccount)
      return res.status(404).json({ message: "Sender account not found" });

    const receiverAccount = await Account.findOne({ accountNo: toAccount });
    if (!receiverAccount)
      return res
        .status(404)
        .json({ message: "an error occured. try again later" });

    const parsedAmount = parseFloat(amount);

    if (senderAccount.balance < parsedAmount)
      return res.status(400).json({ message: "Insufficient funds!" });

    // Update balances
    senderAccount.balance -= parsedAmount;
    receiverAccount.balance += parsedAmount;

    // Save accounts
    await senderAccount.save();
    await receiverAccount.save();

    // Format current date and time
    const now = new Date();
    const formattedDate = format(now, "yyyy-MM-dd");
    const formattedTime = format(now, "HH:mm:ss");

    const receiverUser = await User.findById(receiverAccount.owner);
    if (!receiverUser)
      return res.status(404).json({ message: "Receiver user not found" });
    const senderUser = await User.findById(senderAccount.owner);
    if (!senderUser)
      return res.status(404).json({ message: "Sender user not found" });

    // Create transactions
    const senderTransaction = {
      accountNo: fromAccount,
      amount: -parsedAmount, // Debit from sender
      description: description || "No description",
      date: formattedDate,
      time: formattedTime,
      type: "debit",
      receiver: senderUser._id,
      balance: senderAccount.balance,
    };

    const receiverTransaction = {
      accountNo: toAccount,
      amount: parsedAmount, // Credit to receiver
      description: description || "No description",
      date: formattedDate,
      time: formattedTime,
      type: "credit",
      receiver: receiverUser._id,
      balance: receiverAccount.balance,
    };

    await Transaction.create([senderTransaction, receiverTransaction]);

    // Return success response
    res.status(201).json({
      message: `${amount} sent to account ${toAccount} successfully!`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred. Try again later" });
  }
};

module.exports = { transferMoney };
