const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// Top up wallet - protected route
router.post("/topup", protect, paymentController.createWalletTopup);

// Webhook for Mollie payments - no auth needed (called by Mollie)
router.post("/webhook", paymentController.handleWebhook);
router.get("/user/:userId", protect, paymentController.getUserPayments);

// Check payment status - protected route
router.get("/status/:paymentId", protect, paymentController.checkPaymentStatus);

module.exports = router;