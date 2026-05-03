const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const externalSchema = new Schema(
  {
    bankName: {
      type: String,
    },
    account: {
      type: Number,
    },
    routing: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const External = mongoose.model("External", externalSchema);
module.exports = External;
