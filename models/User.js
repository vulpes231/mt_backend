const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required,
  },
  password: {
    type: String,
    required,
  },
  email: {
    type: String,
    required,
  },
  firstname: {
    type: String,
    required,
  },
  lastname: {
    type: String,
    required,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  refreshToken: {
    type: String,
    default: null,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
