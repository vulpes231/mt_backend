const express = require("express");
const router = express.Router();
const path = require("path");

router.route("/").get((req, res) => {
  let filePath = path.join(__dirname, "..", "views", "index.html");
  res.status(200).sendFile(filePath);
});

module.exports = router;
