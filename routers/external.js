const express = require("express");
const {
  fetchUserExternal,
  addExternalAccount,
} = require("../controllers/externalHandler");

const router = express.Router();

router.route("/").get(fetchUserExternal).post(addExternalAccount);

module.exports = router;
