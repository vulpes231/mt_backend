const express = require("express");
const { createExternalAccount } = require("../controllers/external-acc-cont");

const router = express.Router();

router.route("/").post(createExternalAccount);

module.exports = router;
