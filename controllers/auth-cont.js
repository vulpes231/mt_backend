const usersDB = {
  users: require("../models/users.json"),
  setUser: function (data) {
    this.users = data;
  },
};

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const fsPromises = require("fs").promises;
const path = require("path");

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username and password is required!" });

  try {
    const user = usersDB.users.find((usr) => usr.username === username);
    if (!user)
      return res.status(401).json({ message: "Username does not exist!" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid username or password!" });
    } else {
      const accessToken = jwt.sign(
        {
          username: user.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      );
      const refreshToken = jwt.sign(
        {
          username: user.username,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const otherUsers = usersDB.users.filter(
        (person) => person.username !== user.username
      );

      const currentUser = { ...user, refreshToken };
      usersDB.setUser([...otherUsers, currentUser]);
      await fsPromises.writeFile(
        path.join(__dirname, "..", "models", "users.json"),
        JSON.stringify(usersDB.users)
      );
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ accessToken });
    }
  } catch (error) {
    res.status(500).json({ message: "an error occured." });
  }
};

module.exports = loginUser;
