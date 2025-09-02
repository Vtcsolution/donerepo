const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { protect } = require("../middleware/auth");
const { adminProtect } = require("../middleware/adminProtect");

// Existing wallet routes
router.get("/balance", protect, walletController.getWalletBalance);
router.post("/deduct", protect, walletController.deductCredits);

// Admin route to add credits
router.post("/add-credits", adminProtect, walletController.addCredits);

module.exports = router;