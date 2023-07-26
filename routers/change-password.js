const express = require("express");
const { changeUserPassword } = require("../controllers/change-pass");

const router = express.Router();

router.route("/").put(changeUserPassword);

module.exports = router;
