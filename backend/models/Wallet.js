const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  credits: {
    type: Number,
    default: 0,
    min: 0,
  },
  lock: { type: Boolean, default: false }, // New field to prevent concurrent updates
}, { timestamps: true });

module.exports = mongoose.model("Wallet", walletSchema);