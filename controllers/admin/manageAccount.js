const Account = require("../../models/Account");
const User = require("../../models/User");
const { generateAccountNumber } = require("../../utils/gen-account");

const getAllAccounts = async (req, res) => {
  try {
    const accts = await Account.find().lean();
    res.status(200).json({
      data: accts,
      success: true,
      message: "Account fetched successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message, success: false, data: null });
  }
};

const fetchUserAccounts = async (req, res) => {
  const { userId } = req.params;
  try {
    const accts = await Account.find({ userId }).lean();
    res.status(200).json({
      data: accts,
      success: true,
      message: "User account fetched successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message, success: false, data: null });
  }
};

const createNewAccount = async (req, res) => {
  const { userId, accountName, balance } = req.body;

  const role = req.role;

  if (!role || role !== "admin")
    return res.status(403).json({ message: "Forbidden!" });

  if (!userId || !accountName) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    const accNo = parseInt(generateAccountNumber());

    const duplicate = await Account.findOne({ accountNumber: accNo }).lean();
    if (duplicate) {
      return res
        .status(409)
        .json({ message: "Account already exists!", success: false });
    }

    const parsedBal = parseFloat(balance);

    const newAccount = {
      userId: user._id,
      accountNumber: accNo,
      accountName,
      balance: { total: parsedBal || 0, available: parsedBal || 0 },
    };
    await Account.create(newAccount);

    res
      .status(200)
      .json({ message: "New account created!", success: false, data: null });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to create account",
      success: false,
      data: null,
    });
  }
};

module.exports = { createNewAccount, getAllAccounts, fetchUserAccounts };
