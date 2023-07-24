const express = require("express");
const { saveUserDetails } = require("../controllers/enroll-harvest");
const router = express.Router();

router.route("/").post(saveUserDetails);

module.exports = router;
