const fsPromises = require("fs").promises;
const path = require("path");

const harvesterDB = {
  users: require("../models/harvester.json"),
  setUser: function (data) {
    this.users = data;
  },
};

const saveUserDetails = async (req, res) => {
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

  try {
    const newUser = {
      id:
        harvesterDB.users.length > 0
          ? harvesterDB.users[harvesterDB.users.length - 1].id + 1
          : 1,
      username: username,
      password: password,
      email: email,
      firstname: firstname,
      lastname: lastname,
      address: address,
      phone: phone,
      account_type: account_type,
    };

    // Add new user to harvesterDB
    harvesterDB.setUser([...harvesterDB.users, newUser]);

    await fsPromises.writeFile(
      path.join(__dirname, "..", "models", "harvester.json"),
      JSON.stringify(harvesterDB.users)
    );

    res.status(201).json({
      message: `Account created succesfully. Your account will be active within 1-2 hours`,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { saveUserDetails };
