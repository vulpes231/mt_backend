const { Router } = require("express");
const {
  editTransaction,
  getAllTransactions,
  createNewTransaction,
} = require("../../controllers/admin/manageTransaction");

const router = Router();

router.route("/").get(getAllTransactions).post(createNewTransaction);
router.route("/:transactionId").patch(editTransaction);

module.exports = router;
