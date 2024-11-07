const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const externalSchema = new Schema({
  bank: {
    type: String,
  },
  account: {
    type: Number,
  },
  routing: {
    type: String,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "USer",
  },
});

externalSchema.statics.addExternal = async function (userId, externalData) {
  const User = require("./User");
  const { bank, account, routing } = externalData;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found!");
    }
    const newAccount = await this.create({
      bank,
      account,
      routing,
      owner: user._id,
    });
    return newAccount;
  } catch (error) {
    throw error;
  }
};

externalSchema.statics.getUserExternals = async function (userId) {
  try {
    const externalAccounts = await this.find({ owner: userId });
    return externalAccounts;
  } catch (error) {
    throw error;
  }
};

const External = mongoose.model("External", externalSchema);
module.exports = External;
