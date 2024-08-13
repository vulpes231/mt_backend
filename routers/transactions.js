const express = require("express");

const {
  createNewTransaction,
  getUserTransactions,
  getAllTransactions,
} = require("../controllers/transaction-cont");

const router = express.Router();

router.route("/").get(getUserTransactions).post(createNewTransaction);

router.route("/all").get(getAllTransactions);

module.exports = router;
