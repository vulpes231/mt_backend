const accountsDB = {
  accounts: require("../models/accounts.json"),
  setAccount: function (data) {
    this.accounts = data;
  },
};

const usersDB = {
  users: require("../models/users.json"),
  setUser: function (data) {
    this.users = data;
  },
};

const { generateAccountNumber } = require("../utils/gen-account");
const fsPromises = require("fs").promises;
const path = require("path");
const fs = require("fs");

const getAllAccounts = (req, res) => {
  res.status(200).json(accountsDB.accounts);
};

const createNewAccount = async (req, res) => {
  const { username, account_type } = req.body;

  if (!username || !account_type) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const user = usersDB.users.find((usr) => usr.username === username);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    const accNo = "1763227487154689";

    const duplicate = accountsDB.accounts.find(
      (acc) => acc.account_num === accNo
    );

    if (duplicate) {
      return res.status(409).json({ message: "Account already exists!" });
    } else {
      try {
        // const account_num = generateAccountNumber();
        const newAccount = {
          id:
            accountsDB.accounts.length > 0
              ? accountsDB.accounts[accountsDB.accounts.length - 1].id + 1
              : 1,
          account_owner: username,
          account_num: accNo,
          account_type: account_type,
          available_bal: parseFloat(0).toFixed(2),
          current_bal: parseFloat(0).toFixed(2),
        };
        accountsDB.setAccount([...accountsDB.accounts, newAccount]);
        await fsPromises.writeFile(
          path.join(__dirname, "..", "models", "accounts.json"),
          JSON.stringify(accountsDB.accounts)
        );
        console.log(accountsDB.accounts);
        res.status(201).json({ message: "New account created!" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "an error occured" });
  }
};

const getUserAccountByAccountName = (req, res) => {
  const { username, account_type } = req.params;
  if (!username || !account_type)
    return res.status(400).json({ message: "Invalid details!" });

  const formatAcct = account_type ? account_type.toLowerCase() : undefined;

  if (formatAcct) {
    const decodedAcc = decodeURIComponent(formatAcct);

    const userAcc = accountsDB.accounts.filter(
      (acct) =>
        acct.account_owner === username && acct.account_type === decodedAcc
    );

    if (userAcc.length === 0)
      return res.status(400).json({ message: "Invalid user!" });
    res.status(200).json(userAcc);
  } else {
    // Handle the case where account_type is not provided in the URL
    return res
      .status(400)
      .json({ message: "Account type not provided in the URL." });
  }
};

const getUserAccount = (req, res) => {
  const username = req.username;
  try {
    const account = accountsDB.accounts.filter(
      (acct) => acct.account_owner === username
    );

    if (account.length === 0)
      return res.status(400).json({ message: "user has no accounts" });
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: "an error occured" });
  }
};

module.exports = {
  createNewAccount,
  getAllAccounts,
  getUserAccount,
  getUserAccountByAccountName,
};
