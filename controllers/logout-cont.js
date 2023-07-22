const userDB = {
  users: require("../models/users.json"),
  setUser: function (data) {
    this.users = data;
  },
};

const fsPromises = require("fs").promises;
const path = require("path");

const handleUserLogout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;

  const user = userDB.users.find((usr) => usr.refreshToken === refreshToken);

  if (!user) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.sendStatus(204);
  } else {
    const otherUsers = userDB.users.filter(
      (usr) => usr.refreshToken !== user.refreshToken
    );
    const currentUser = { ...user, refreshToken: "" };
    adminDB.setAdmin([...otherUsers, currentUser]);
    await fsPromises.writeFile(
      path.join(__dirname, "..", "models", "admin.json")
    );
    JSON.stringify(userDB.users);
  }
};

module.exports = {
  handleUserLogout,
};
