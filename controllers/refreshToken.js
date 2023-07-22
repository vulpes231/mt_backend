const userDB = {
  users: require("../models/users.json"),
  setEmployee: function (data) {
    this.users = data;
  },
};

const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleUserToken = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401);
  console.log(cookies.jwt);

  const refreshToken = cookies.jwt;

  const user = userDB.users.find((emp) => emp.refreshToken === refreshToken);

  if (!user) return res.status(403).json({ message: "Forbidden!" });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || user.username !== decoded.username) return res.status(403);
    const accessToken = jwt.sign(
      { username: decoded.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2m" }
    );

    res.status(200).json({ accessToken });
  });
};

module.exports = { handleUserToken };
