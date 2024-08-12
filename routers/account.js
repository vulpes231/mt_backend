const express = require("express");

const {
  getAllAccounts,
  createNewAccount,
  getUserAccount,
  getUserAccountByAccountName,
} = require("../controllers/account-cont");

const router = express.Router();

router.route("/").get(getUserAccount).post(createNewAccount);
router.route("/all").get(getAllAccounts);
router.route("/:username/:account_type").get(getUserAccountByAccountName);

module.exports = router;
