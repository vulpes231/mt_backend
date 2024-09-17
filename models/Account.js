const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const accountSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountNo: {
    type: Number,
    required: true,
  },
  accountType: {
    type: String,
    enum: [
      "facebook premium savings",
      "facebook premium checking",
      "account access boost (AAB)",
    ],
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
});

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
