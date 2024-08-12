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

const { format } = require("date-fns");
const path = require("path");
const fsPromises = require("fs").promises;

function updateBal(balance, amount, trans_type) {
  if (trans_type === "credit") {
    const newBal = balance + parseFloat(amount);
    return newBal;
  } else if (trans_type === "debit") {
    const newBal = balance - parseFloat(amount); // Subtract the amount for "debit" transactions
    return newBal;
  }
}

const getAllTransactions = (req, res) => {
  res.status(200).json(transactionsDB.transactions);
};

const getUserTransactions = (req, res) => {
  const username = req.username;

  try {
    const userTransactions = transactionsDB.transactions.filter(
      (usr) => usr.to === username || usr.from === username
    );

    if (userTransactions.length === 0) {
      return res.status(404).json({ message: "User account not found!" });
    }

    return res.status(200).json(userTransactions);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const createNewTransaction = async (req, res) => {
  const {
    from,
    to,
    description,
    amount,
    trans_type,
    account_typeA,
    account_typeB,
    date,
  } = req.body;

  if (
    !from ||
    !to ||
    !description ||
    !amount ||
    !trans_type ||
    !account_typeA ||
    !account_typeB ||
    !date
  )
    return res.status(400).json({ message: "Invalid transaction data!" });

  // Step 1: Find the user's account in the accountsDB
  const userAccountIndex = accountsDB.accounts.findIndex(
    (acct) => acct.account_owner === from
  );

  if (userAccountIndex === -1)
    return res.status(404).json({ message: "User account not found!" });

  try {
    // Step 2: Get the current balance and calculate the new available balance after the transaction
    const currentBalance = parseFloat(
      accountsDB.accounts[userAccountIndex].current_bal
    );
    const availableBalance = parseFloat(
      accountsDB.accounts[userAccountIndex].available_bal
    );
    const amountValue = parseFloat(amount);

    let newAvailableBal;
    let newCurrentBal; // Add this variable to hold the new current balance

    if (trans_type === "credit") {
      // Credit transaction adds to available balance
      newAvailableBal = availableBalance + amountValue;

      // For credit transaction, set the new current balance to the transaction amount
      newCurrentBal = amountValue;
    } else if (trans_type === "debit") {
      // Debit transaction subtracts from available balance
      newAvailableBal = availableBalance - amountValue;

      // Ensure the account has sufficient balance for debit transaction
      if (newAvailableBal < 0) {
        return res
          .status(400)
          .json({ message: "Insufficient balance for the debit transaction!" });
      }

      // For debit transaction, set the new current balance to the transaction amount
      newCurrentBal = amountValue;
    } else {
      return res.status(400).json({ message: "Invalid transaction type!" });
    }

    // Update the user's account in the accountsDB with the new available balance and current balance
    accountsDB.accounts[userAccountIndex].available_bal =
      newAvailableBal.toFixed(2);
    accountsDB.accounts[userAccountIndex].current_bal =
      newCurrentBal.toFixed(2);

    // Step 3: Create a new transaction object

    const newTransaction = {
      id:
        transactionsDB.transactions.length > 0
          ? transactionsDB.transactions[transactionsDB.transactions.length - 1]
              .id + 1
          : 1,
      from: from || null,
      to: to || null,
      amount: amountValue.toFixed(2),
      memo: description,
      date: date,
      trans_type: trans_type,
      origin: account_typeA,
      destination: account_typeB,
    };

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

    // Send a response indicating success (you can modify this as needed)
    res.status(200).json({ message: "Transaction created successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating transaction!" });
  }
};

const deleteTransactions = (req, res) => {};

module.exports = {
  createNewTransaction,
  getUserTransactions,
  getAllTransactions,
};
