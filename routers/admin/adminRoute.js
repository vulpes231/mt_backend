const { Router } = require("express");
const {
  createAdminAccount,
  loginAdminAccount,
  getAdminInfo,
  logoutAdmin,
} = require("../../controllers/admin/adminController");
const { verifyToken } = require("../../middlewares/verifyToken");

const router = Router();

const requireAdmin = verifyToken("admin");

router.route("/").get(requireAdmin, getAdminInfo);

router.route("/logout").put(requireAdmin, logoutAdmin);
router.route("/login").post(loginAdminAccount);
router.route("/register").post(createAdminAccount);

module.exports = router;
