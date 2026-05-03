const bcrypt = require("bcryptjs");
const { generateAccountNumber } = require("../../utils/gen-account");
const Account = require("../../models/Account");
const User = require("../../models/User");
const Transaction = require("../../models/Transaction");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    res.status(200).json({
      data: users,
      success: true,
      message: "Users fetched successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      success: false,
    });
  }
};

const createNewUser = async (req, res) => {
  const role = req.role;

  if (!role || role !== "admin")
    return res.status(403).json({ message: "Forbidden!" });

  const {
    firstname,
    lastname,
    username,
    password,
    email,
    address,
    accountType,
    phone,
  } = req.body;

  console.log(req.body);

  if (
    !username ||
    !password ||
    !firstname ||
    !lastname ||
    !email ||
    !phone ||
    !address ||
    !accountType
  )
    return res.status(400).json({ message: "All fields required" });

  const duplicate = await User.findOne({ username: username });
  if (duplicate) {
    res.status(409).json({ message: "User already exists!" });
  } else {
    try {
      const accNo = parseInt(generateAccountNumber());
      const hashedPwd = await bcrypt.hash(password, 10);

      const newUser = {
        username: username,
        password: hashedPwd,
        email: email,
        firstname: firstname,
        lastname: lastname,
        address: address,
        phone: phone,
      };

      const createUser = await User.create(newUser);

      const newAccount = {
        owner: createUser._id,
        accountNo: accNo,
        accountType: accountType,
      };

      await Account.create(newAccount);

      res.status(201).json({ message: `New User ${username} created!` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const userAccount = await Account.deleteMany({ owner: userId });
    if (!userAccount)
      return res.status(404).json({ message: "User account not found!" });

    await Transaction.deleteMany({ receiver: userId });

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found!" });

    res
      .status(200)
      .json({ message: "User deleted!", data: null, success: true });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      success: false,
    });
  }
};

module.exports = { createNewUser, getAllUsers, deleteUser };
