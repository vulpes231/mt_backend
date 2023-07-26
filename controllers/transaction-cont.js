const accountsDB = {
  accounts: require("../models/accounts.json"),
  setAccount: function (data) {
    this.accounts = data;
  },
  updateAccount: function (accountIndex, newAvailableBal) {
    if (accountIndex !== -1) {
      this.accounts[accountIndex].available_bal = newAvailableBal;
    }
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
  const { username } = req.params;
  if (!username) return res.status(400).json({ message: "User not found!" });
  const userTransactions = transactionsDB.transactions.filter(
    (usr) => usr.username === username
  );
  res.status(200).json(userTransactions);
};

const createNewTransaction = async (req, res) => {
  const { username, description, amount, trans_type, account_type, date } =
    req.body;

  if (
    !username ||
    !description ||
    !amount ||
    !trans_type ||
    !account_type ||
    !date
  )
    return res.status(400).json({ message: "Invalid transaction data!" });

  // Step 1: Find the user's account in the accountsDB
  const userAccountIndex = accountsDB.accounts.findIndex(
    (acct) => acct.account_owner === username
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
      username: username,
      description: description,
      amount: amountValue.toFixed(2),
      date: date,
      available_bal: newAvailableBal.toFixed(2),
      trans_type: trans_type,
      account_type: account_type,
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
