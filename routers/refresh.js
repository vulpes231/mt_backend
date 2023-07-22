const express = require("express");
const { handleUserToken } = require("../controllers/refreshToken");
const router = express.Router();

router.route("/").get(handleUserToken);

module.exports = router;
