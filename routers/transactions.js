const express = require("express");

const {
  getUserTransactions,
  getAccountTransaction,
} = require("../controllers/transaction-cont");

const router = express.Router();

router.route("/").get(getUserTransactions);

router.route("/account").get(getAccountTransaction);

module.exports = router;
