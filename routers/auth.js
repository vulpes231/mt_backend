const express = require("express");
const loginUser = require("../controllers/auth-cont");
const router = express.Router();

router.route("/").post(loginUser);

module.exports = router;
