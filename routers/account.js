const express = require("express");

const {
  getAllAccounts,
  createNewAccount,
  getUserAccount,
  getUserAccountByAccountName,
} = require("../controllers/account-cont");

const router = express.Router();

router.route("/").get(getAllAccounts).post(createNewAccount);
router.route("/:username").get(getUserAccount);
router.route("/:username/:account_type").get(getUserAccountByAccountName);

module.exports = router;
