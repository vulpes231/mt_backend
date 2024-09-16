const express = require("express");
const {
  getAllUsers,
  updateUser,
  getUser,
  deleteUser,
} = require("../controllers/users-cont");
const router = express.Router();

router.route("/").get(getUser).put(updateUser);
router.route("/all").get(getAllUsers);
router.route("/:id").delete(deleteUser);

module.exports = router;
