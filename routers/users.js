const express = require("express");
const {
  getAllUsers,
  updateUser,
  getUser,
  deleteUser,
} = require("../controllers/users-cont");
const router = express.Router();

router.route("/").get(getUser).put(updateUser);

module.exports = router;
