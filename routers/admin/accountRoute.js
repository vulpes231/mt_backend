const express = require("express");
const {
  getAllAccounts,
  createNewAccount,
} = require("../../controllers/admin/manageAccount");

const router = express.Router();

router.route("/").get(getAllAccounts).post(createNewAccount);

module.exports = router;
