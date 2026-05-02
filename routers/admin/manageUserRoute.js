const express = require("express");
const {
  createNewUser,
  deleteUser,
  getAllUsers,
} = require("../../controllers/admin/manageUser");
const router = express.Router();

router.route("/").get(getAllUsers).post(createNewUser);
router.route("/:userId").delete(deleteUser);

module.exports = router;
