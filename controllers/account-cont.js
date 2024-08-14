const { generateAccountNumber } = require("../utils/gen-account");
const User = require("../models/User");
const Account = require("../models/Account");

const getAllAccounts = async (req, res) => {
  try {
    const accts = await Account.find();
    res.status(200).json({ accts });
  } catch (error) {
    res.status(500).json({ message: "an error occured" });
  }
};

const createNewAccount = async (req, res) => {
  const { username, accountType } = req.body;

  if (!username || !accountType) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const user = await User.findOne({ useranme: username });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    const accNo = parseInt(generateAccountNumber());

    const duplicate = await Account.findOne({ accountNo: accNo });
    if (duplicate) {
      return res.status(409).json({ message: "Account already exists!" });
    }

    const newAccount = {
      owner: user._id,
      accountNo: accNo,
      accountType: accountType,
    };
    await Account.create(newAccount);
    res.status(201).json({ message: "New account created!" });
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

const getUserAccount = async (req, res) => {
  const username = req.user;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "user not found" });
    const accounts = await Account.find({ owner: user._id });

    if (accounts.length === 0)
      return res.status(400).json({ message: "user has no accounts" });
    res.status(200).json({ accounts });
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
