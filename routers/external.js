const express = require("express");
const {
  fetchUserExternal,
  addExternalAccount,
  editUserExternal,
} = require("../controllers/externalHandler");

const router = express.Router();

router.route("/").get(fetchUserExternal).post(addExternalAccount);
router.route("/update").post(editUserExternal);

module.exports = router;
