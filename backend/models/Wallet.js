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
  lock: { type: Boolean, default: false }, // For concurrent update prevention
}, { timestamps: true });

// Index for performance
walletSchema.index({ userId: 1, lock: 1 }); // Optimize queries for wallet updates

// Pre-save validation to ensure consistency
walletSchema.pre("save", function (next) {
  if (this.credits < 0) {
    return next(new Error("Credits cannot be negative"));
  }
  if (this.balance < 0) {
    return next(new Error("Balance cannot be negative"));
  }
  next();
});

module.exports = mongoose.model("Wallet", walletSchema);
