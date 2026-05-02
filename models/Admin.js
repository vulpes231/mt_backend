const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    accessCode: { type: String },
    refreshToken: { type: String },
    role: { type: String, default: "admin" },
    isSuperUser: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
