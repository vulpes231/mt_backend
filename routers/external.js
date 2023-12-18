const express = require("express");
const {
  createExternalAccount,
  getUserExternalAccounts,
} = require("../controllers/external-acc-cont");

const router = express.Router();

router.route("/").post(createExternalAccount);
router.route("/:username").get(getUserExternalAccounts);

module.exports = router;
