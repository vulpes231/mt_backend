const express = require("express");

const {
  getAllAccounts,
  createNewAccount,
} = require("../controllers/account-cont");

const router = express.Router();

router.route("/").get(getAllAccounts).post(createNewAccount);

module.exports = router;
