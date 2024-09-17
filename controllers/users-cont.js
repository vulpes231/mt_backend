const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: err.message });
  }
};

const getUser = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(200).json({ message: "an error occured" });
  }
};

const updateUser = async (req, res) => {
  const { email, phone, address } = req.body;

  const userName = req.user;

  try {
    const user = await User.findOne({ username: userName });
    if (!user) return res.status(400).json({ message: "User not found." });

    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    res.status(200).json({ message: `${user.username} profile updated!` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const userAccount = await Account.deleteMany({ owner: id });
    if (!userAccount)
      return res.status(404).json({ message: "User account not found!" });

    const userTransactions = await Transaction.deleteMany({ receiver: id });

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found!" });

    res.status(200).json({ message: "User deleted!" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the user." });
  }
};

module.exports = { getAllUsers, updateUser, getUser, deleteUser };
