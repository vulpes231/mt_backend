const express = require("express");
const {
  getAllUsers,
  updateUser,
  getUser,
} = require("../controllers/users-cont");
const router = express.Router();

router.route("/").get(getUser).put(updateUser);
router.route("/all").get(getAllUsers);

module.exports = router;
