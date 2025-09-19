const express = require("express");

const {
	getAllAccounts,
	createNewAccount,
	getUserAccountByAccountName,
	getUserAccounts,
	getAccountInfo,
} = require("../controllers/account-cont");

const router = express.Router();

router.route("/").get(getUserAccounts).post(createNewAccount);
router.route("/all").get(getAllAccounts);
router.route("/:accountId").get(getAccountInfo);

module.exports = router;
