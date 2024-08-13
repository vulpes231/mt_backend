const User = require("../models/User");

const handleUserLogout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  try {
    const refreshToken = cookies.jwt;

    const user = await User.findOne({ refreshToken: refreshToken });
    if (!user) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.status(404).json({ message: "user not found!" });
    }

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    user.refreshToken = null;
    await user.save();
    res.status(204).json({ message: "user logged out successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "an error occured" });
  }
};

module.exports = {
  handleUserLogout,
};
