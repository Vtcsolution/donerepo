const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  creditsPurchased: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  molliePaymentId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "expired", "canceled"],
    default: "pending"
  },
  creditsAdded: {
    type: Number,
    default: 0
  },
  redirectUrl: {
    type: String,
    required: true
  },
  webhookUrl: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);