const { generateAccountNumber } = require("../utils/gen-account");
const User = require("../models/User");
const Account = require("../models/Account");

const getAccountInfo = async (req, res) => {
  const { accountId } = req.params;
  if (!accountId)
    return res
      .status(400)
      .json({ message: "Invalid account ID!", status: false });

  try {
    const accountInfo = await Account.findById(accountId);
    res.status(200).json({
      data: accountInfo,
      success: true,
      message: "Account info fetched successfully.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message, success: false, data: null });
  }
};

const getUserAccounts = async (req, res) => {
  const userId = req.userId;
  if (!userId)
    return res
      .status(401)
      .json({ message: "You're not logged in!", success: false });

  try {
    const userAccounts = await Account.find({ userId }).lean();

    res.status(200).json({
      data: userAccounts,
      success: true,
      message: "User accounts fetched successfully.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "an error occured", success: false, data: null });
  }
};

module.exports = {
  getUserAccounts,
  getAccountInfo,
};
