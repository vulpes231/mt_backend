const express = require("express");

const {
  createNewTransaction,
  getUserTransactions,
  getAllTransactions,
} = require("../controllers/transaction-cont");

const router = express.Router();

router.route("/").get(getAllTransactions).post(createNewTransaction);

router.route("/:username/:account_type").get(getUserTransactions);

module.exports = router;
