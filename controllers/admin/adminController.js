const { generateAdminToken } = require("../../middlewares/verifyToken");
const Admin = require("../../models/Admin");
const bcrypt = require("bcryptjs");

const createAdminAccount = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Bad request" });
  try {
    const userExist = await Admin.findOne({ username });
    if (userExist) return res.status(409).json({ message: "User exists!" });

    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = await Admin.create({ username, password: hashedPass });

    const user = await Admin.findById(newUser._id)
      .select("-password -refreshToken")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found!" });
    res
      .status(200)
      .json({ message: "Admin created.", data: user, success: true });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to create admin",
      data: null,
      success: false,
    });
  }
};

const loginAdminAccount = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Bad request" });
  // console.log("form exits");
  try {
    const user = await Admin.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found!" });

    // console.log("found user");

    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch)
      return res.status(400).json({ message: "Invalid username or password!" });

    // console.log("correct pass check");

    const token = await generateAdminToken(
      user.username,
      user._id,
      user.role,
      "access",
    );

    // console.log("access gen");

    const refreshToken = await generateAdminToken(
      user.username,
      user._id,
      user.role,
      "refresh",
    );

    // console.log("refresh gen");

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      token: token,
      data: null,
      success: true,
      message: "Login success.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to login admin",
      data: null,
      success: false,
    });
  }
};

const getAdminInfo = async (req, res) => {
  const userId = req.userId;

  try {
    const admin = await Admin.findById(userId);
    if (!admin) return res.status(404).json({ message: "User not found!" });

    res.status(200).json({
      data: admin,
      success: true,
      message: "Admin info fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to fetch admin",
      data: null,
      success: false,
    });
  }
};

module.exports = { loginAdminAccount, createAdminAccount, getAdminInfo };
