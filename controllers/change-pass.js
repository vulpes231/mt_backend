const bcrypt = require("bcryptjs");
const User = require("../models/User");

const changeUserPassword = async (req, res) => {
  const { password, newPassword } = req.body;

  if (!password || !newPassword)
    return res
      .status(400)
      .json({ message: "current password and new password required!" });
  try {
    const user = await User.findOne({ username: username });
    if (!user) return res.status(401).json({ message: "user not found!" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "invalid password!" });

    const hashedPwd = await bcrypt.hash(newPassword, 10);
    user.password = hashedPwd;

    await user.save();
    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the password!" });
  }
};

module.exports = { changeUserPassword };
