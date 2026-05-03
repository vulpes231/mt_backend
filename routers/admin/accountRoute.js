const express = require("express");
const {
  getAllAccounts,
  createNewAccount,
  fetchUserAccounts,
} = require("../../controllers/admin/manageAccount");

const router = express.Router();

router.route("/").get(getAllAccounts).post(createNewAccount);
router.route("/:userId").get(fetchUserAccounts);

module.exports = router;
