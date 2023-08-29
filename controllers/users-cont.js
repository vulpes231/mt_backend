const usersDB = {
  users: require("../models/users.json"),
  setUser: function (data) {
    this.users = data;
  },
};

const bcrypt = require("bcryptjs");
const fsPromises = require("fs").promises;
const path = require("path");

const getAllUsers = (req, res) => {
  res.status(200).json(usersDB.users);
};

const getUser = async (req, res) => {
  const { username } = req.params;

  const user = usersDB.users.find((usr) => usr.username === username);
  if (!user) return res.status(404).json({ message: "user not found" });
  res.status(200).json(user);
};

const updateUser = async (req, res) => {
  const { email, phone, address, username } = req.body;

  console.log(username);
  console.log(email);

  if (!email && !phone && !address)
    return res.status(400).json({ message: "At least one value is required!" });

  const user = usersDB.users.find((usr) => usr.username === username);

  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  try {
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    // Save the updated user back to the usersDB.users array
    const updatedUsers = usersDB.users.map((usr) =>
      usr.username === user.username ? user : usr
    );
    usersDB.setUser(updatedUsers);

    // Save the updated user array to the JSON file
    await fsPromises.writeFile(
      path.join(__dirname, "..", "models", "users.json"),
      JSON.stringify(usersDB.users)
    );

    console.log(usersDB.users);
    res.status(200).json({ message: `${username} profile updated!` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { getAllUsers, updateUser, getUser };
