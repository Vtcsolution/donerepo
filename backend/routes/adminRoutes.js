// routes/adminRoutes.js
const express = require("express");
const {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  registerAdmin,
  logoutAdmin,
} = require("../controllers/adminController");
const { adminProtect } = require("../middleware/adminProtect");

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/register", registerAdmin); 
router.post("/logout", logoutAdmin); // ← Add logout route

router.get("/profile", adminProtect, getAdminProfile);
router.put("/profile", adminProtect, updateAdminProfile);

module.exports = router;
