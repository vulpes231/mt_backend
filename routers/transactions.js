const express = require("express");

const {
  createNewTransaction,
  getUserTransactions,
  getAllTransactions,
} = require("../controllers/transaction-cont");

const router = express.Router();

router.route("/").get(getAllTransactions).post(createNewTransaction);

router.route("/:username").get(getUserTransactions);

module.exports = router;
