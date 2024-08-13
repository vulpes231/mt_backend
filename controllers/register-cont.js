const bcrypt = require("bcryptjs");
const { generateAccountNumber } = require("../utils/gen-account");
const User = require("../models/User");
const Account = require("../models/Account");

const createNewUser = async (req, res) => {
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

module.exports = createNewUser;
