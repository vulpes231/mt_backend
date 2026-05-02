const { Router } = require("express");
const {
  createAdminAccount,
  loginAdminAccount,
  getAdminInfo,
} = require("../../controllers/admin/adminController");
const { verifyToken } = require("../../middlewares/verifyToken");

const router = Router();

router.route("/").get(verifyToken("admin"), getAdminInfo);
router.route("/login").post(loginAdminAccount);
router.route("/register").post(createAdminAccount);

module.exports = router;
