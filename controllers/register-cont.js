const usersDB = {
  users: require("../models/users.json"),
  setUser: function (data) {
    this.users = data;
  },
};

const fsPromises = require("fs").promises;
const path = require("path");
const bcrypt = require("bcrypt");

const createNewUser = async (req, res) => {
  const { firstname, lastname, username, password, email, address, phone } =
    req.body;
  if (
    !username ||
    !password ||
    !firstname ||
    !lastname ||
    !email ||
    !phone ||
    !address
  )
    return res.status(400).json({ message: "All fields required" });

  const duplicate = usersDB.users.find((admin) => admin.username === username);
  if (duplicate) {
    res.status(409).json({ message: "User already exist!" });
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
      };
      usersDB.setUser([...usersDB.users, newUser]);
      await fsPromises.writeFile(
        path.join(__dirname, "..", "models", "users.json"),
        JSON.stringify(usersDB.users)
      );
      console.log(usersDB.users);
      res.status(201).json({ message: `New User ${username} created!` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = createNewUser;
