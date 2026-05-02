const express = require("express");
const {
  createNewUser,
  deleteUser,
  getAllUsers,
} = require("../../controllers/admin/manageUser");
const router = express.Router();

router.route("/").get(getAllUsers).post(createNewUser).delete(deleteUser);

module.exports = router;
