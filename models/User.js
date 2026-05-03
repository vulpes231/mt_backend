const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      street: { type: String },
      country: { type: String },
      state: { type: String },
      city: { type: String },
      zip: { type: String },
    },
    security: {
      isTwofa: { type: Boolean, default: false },
      type: { type: String, enum: ["code", "pin"] },
      pin: { type: String },
    },
    accountStatus: {
      withdrawEnabled: { type: Boolean, default: true },
      withdrawError: { type: String },
      withdrawLimit: { type: Number, default: 1000 },
      isBanned: { type: Boolean, default: false },
      isEmailverified: { type: Boolean, default: false },
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
module.exports = User;
