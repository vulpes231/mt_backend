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
    street,
    country,
    city,
    state,
    zip,
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
    !street ||
    !country ||
    !city ||
    !state ||
    !zip ||
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
        address: { street, state, city, country, zip },
        phone: phone,
      };

      const createUser = await User.create(newUser);

      const newAccount = {
        userId: createUser._id,
        accountNumber: accNo,
        accountName: accountType,
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
    const userAccount = await Account.deleteMany({ userId: userId });
    if (!userAccount)
      return res.status(404).json({ message: "User account not found!" });

    await Transaction.deleteMany({ userId: userId });

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
