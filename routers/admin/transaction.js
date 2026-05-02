const { Router } = require("express");
const {
  editTransaction,
} = require("../../controllers/admin/manageTransaction");

const router = Router();

router.route("/:transactionId").patch(editTransaction);

module.exports = router;
