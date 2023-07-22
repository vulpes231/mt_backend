const express = require("express");
const { handleUserLogout } = require("../controllers/logout-cont");
const router = express.Router();

router.route("/").get(handleUserLogout);

module.exports = router;
