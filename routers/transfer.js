const express = require("express");
const { transferMoney } = require("../controllers/transfer-cont");

const router = express.Router();

router.route("/").post(transferMoney);

module.exports = router;
