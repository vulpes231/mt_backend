const express = require("express");

const {
  getAllAccounts,
  createNewAccount,
  getUserAccounts,
  getAccountInfo,
} = require("../controllers/account-cont");

const router = express.Router();

router.route("/").get(getUserAccounts);
router.route("/:accountId").get(getAccountInfo);

module.exports = router;
