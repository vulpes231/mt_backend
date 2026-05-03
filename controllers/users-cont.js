const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const getUser = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(400).json({ message: "Bad request!" });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found" });
    res.status(200).json({
      data: user,
      message: "User info fetched successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      success: false,
    });
  }
};

const updateUser = async (req, res) => {
  const { email, phone, street, state, country, city, zip } = req.body;

  const userId = req.userId;
  if (!userId) return res.status(400).json({ message: "Bad request!" });

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(400).json({ message: "User not found." });

    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (street) user.address.street = street;
    if (state) user.address.state = state;
    if (country) user.address.country = country;
    if (city) user.address.city = city;
    if (zip) user.address.zip = zip;

    await user.save();

    res.status(200).json({
      message: `${user.username} profile updated!`,
      data: null,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      success: false,
    });
  }
};

const activateTwoFactor = async (req, res) => {
  const { type, pin } = req.body;

  const userId = req.userId;
  if (!userId) return res.status(400).json({ message: "Bad request!" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found." });

    if (type) user.security.type = type;

    if (type === "pin" && pin) {
      user.security.pin = pin;
    }
    user.security.isTwofa = true;

    await user.save();

    res.status(200).json({
      message: `${user.username} profile updated!`,
      data: null,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      success: false,
    });
  }
};

module.exports = { updateUser, getUser, activateTwoFactor };
