const express = require("express");

const {
	createNewTransaction,
	getUserTransactions,
	getAllTransactions,
	getAccountTransaction,
} = require("../controllers/transaction-cont");

const router = express.Router();

router.route("/").get(getUserTransactions).post(createNewTransaction);

router.route("/all").get(getAllTransactions);
router.route("/account").get(getAccountTransaction);

module.exports = router;
