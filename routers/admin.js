const { Router } = require("express");
const { editTransaction } = require("../controllers/admin/adminControllers");

const router = Router();

router.route("/edit-transaction/:transactionId").post(editTransaction);

module.exports = router;
