const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const accountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountNumber: {
      type: Number,
      required: true,
    },
    accountName: {
      type: String,
      enum: [
        "facebook premium savings",
        "facebook premium checking",
        "account access boost (AAB)",
        "AAB deficit",
      ],
      required: true,
    },
    balance: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
