const usersDB = {
  users: require("../models/users.json"),
  setUser: function (data) {
    this.users = data;
  },
};

const accountsDB = {
  accounts: require("../models/accounts.json"),
  setAccount: function (data) {
    this.accounts = data;
  },
};

const fsPromises = require("fs").promises;
const path = require("path");
const bcrypt = require("bcrypt");
const { generateAccountNumber } = require("../utils/gen-account");

const createNewUser = async (req, res) => {
  const {
    firstname,
    lastname,
    username,
    password,
    email,
    address,
    account_type,
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
    !account_type
  )
    return res.status(400).json({ message: "All fields required" });

  const duplicate = usersDB.users.find((admin) => admin.username === username);
  if (duplicate) {
    res.status(409).json({ message: "User already exists!" });
  } else {
    try {
      const hashedPwd = await bcrypt.hash(password, 10);
      const newUser = {
        id:
          usersDB.users.length > 0
            ? usersDB.users[usersDB.users.length - 1].id + 1
            : 1,
        username: username,
        password: hashedPwd,
        email: email,
        firstname: firstname,
        lastname: lastname,
        address: address,
        phone: phone,
        account_type: account_type,
        account_no: generateAccountNumber(),
      };

      // Add new user to usersDB
      usersDB.setUser([...usersDB.users, newUser]);

      // Create a new account for the user and add to accountsDB
      const newAccount = {
        id:
          accountsDB.accounts.length > 0
            ? accountsDB.accounts[accountsDB.accounts.length - 1].id + 1
            : 1,
        account_owner: username,
        account_num: newUser.account_no,
        account_type: account_type,
        available_bal: parseFloat(0).toFixed(2), // Set initial available balance to 0 as a number
        current_bal: parseFloat(0).toFixed(2), // Set initial current balance to 0 as a number
      };
      accountsDB.setAccount([...accountsDB.accounts, newAccount]);

      // Save the updated users and accounts to their respective JSON files
      await fsPromises.writeFile(
        path.join(__dirname, "..", "models", "users.json"),
        JSON.stringify(usersDB.users)
      );
      await fsPromises.writeFile(
        path.join(__dirname, "..", "models", "accounts.json"),
        JSON.stringify(accountsDB.accounts)
      );

      console.log(usersDB.users);
      console.log(accountsDB.accounts);

      res.status(201).json({ message: `New User ${username} created!` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = createNewUser;

module.exports = createNewUser;
