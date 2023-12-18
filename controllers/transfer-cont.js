const usersDB = {
  users: require("../models/users.json"),
  setUser: function (data) {
    this.users = data;
  },
};

const accountsDB = {
  accounts: require("../models/accounts.json"),
  setAccount: function (data) {
    this.accounts = data;
  },
};

const transactionsDB = {
  transactions: require("../models/transactions.json"),
  setTransaction: function (data) {
    this.transactions = data;
  },
};

// const fs = require('fs');
const fsPromises = require("fs").promises;
const path = require("path");

const transferMoney = async (req, res) => {
  // data needed
  const { sender_acct, receiver_acct, amount, memo } = req.body;

  //   check if the correct data was sent then proceed otherwise return error
  if (!sender_acct || !receiver_acct || !amount)
    return res.status(400).json({ message: "Invalid tranfer details" });

  const amt = parseFloat(amount);

  console.log("Amount", amt);

  try {
    // find sender account in db if it exists then store temporarily or return error
    const senderAccount = accountsDB.accounts.find(
      (acct) => acct.account_num === sender_acct
    );
    if (!senderAccount) return res.sendStatus(404);

    // get sender balance
    let senderBalance = parseFloat(senderAccount.available_bal).toFixed(2);
    console.log("Sender Initial balance", senderBalance);

    //   check if the sender account has enough funds to cover the transaction
    if (senderBalance < amt)
      return res.status(400).json({ message: "Insuffient funds!" });

    // find receiver account in db if it exists then store temporarily or return error
    const receiverAccount = accountsDB.accounts.find(
      (acct) => acct.account_num === receiver_acct
    );
    if (!receiverAccount) return res.sendStatus(404);
    // get receiver balance
    let receiverBalance = parseFloat(receiverAccount.available_bal);
    // console.log("Receiver Initial balance", receiverBalance);

    // update the account balances
    senderAccount.available_bal = senderBalance -= amt;
    receiverAccount.available_bal = receiverBalance += amt;

    senderAccount.current_bal = amt;
    receiverAccount.current_bal = amt;

    const newDate = new Date();
    console.log(newDate);

    // create new transaction
    const newTransaction = {
      id:
        transactionsDB.transactions.length > 0
          ? transactionsDB.transactions[transactionsDB.transactions.length - 1]
              .id + 1
          : 1,
      from: senderAccount.account_owner,
      to: receiverAccount.account_owner,
      amount: amt,
      memo: memo || "Transfer",
      date: newDate,
      origin: senderAccount.account_type,
      destination: receiverAccount.account_type,
      trans_type: null,
    };

    // save to db

    // Step 4: Add the new transaction to transactionsDB.transactions
    transactionsDB.transactions.push(newTransaction);
    await fsPromises.writeFile(
      path.join(__dirname, "..", "models", "transactions.json"),
      JSON.stringify(transactionsDB.transactions)
    );

    // Save the updated users and accounts to their respective JSON files
    await fsPromises.writeFile(
      path.join(__dirname, "..", "models", "accounts.json"),
      JSON.stringify(accountsDB.accounts)
    );

    // return success response
    res.status(201).json({
      message: `${amount} sent to account ${receiverAccount.account_owner} successfully!`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured. Try again later" });
  }
};

module.exports = { transferMoney };
