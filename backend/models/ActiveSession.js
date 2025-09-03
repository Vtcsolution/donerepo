const mongoose = require("mongoose");

const activeSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  psychicId: { type: mongoose.Schema.Types.ObjectId, ref: "AiPsychic", required: true },
  startTime: { type: Date, required: true },
  freeEndTime: { type: Date, required: true },
  remainingFreeTime: { type: Number, default: 60, min: 0 }, // Added min: 0 for validation
  lastChargeTime: { type: Date, required: true },
  paidSession: { type: Boolean, default: false },
  paidStartTime: { type: Date },
  freeSessionUsed: { type: Boolean, default: false },
  initialCredits: { type: Number, default: 0 }, // Changed default to 0 for consistency
  isArchived: { type: Boolean, default: false },
  lock: { type: Boolean, default: false }, // For concurrent update prevention
}, { timestamps: true });

// Indexes for performance
activeSessionSchema.index({ userId: 1, psychicId: 1 }, { unique: true }); // Unique index for user-psychic pair
activeSessionSchema.index({ userId: 1, psychicId: 1, lock: 1, paidSession: 1, isArchived: 1 }); // Optimize queries for session status and stop
activeSessionSchema.index({ updatedAt: 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60, // Auto-remove archived sessions after 30 days
  partialFilterExpression: { isArchived: true }
});

// Pre-save validation to ensure consistency
activeSessionSchema.pre("save", function (next) {
  if (this.remainingFreeTime < 0) {
    return next(new Error("Remaining free time cannot be negative"));
  }
  if (this.paidSession && !this.paidStartTime) {
    return next(new Error("Paid session must have a paidStartTime"));
  }
  next();
});

module.exports = mongoose.model("ActiveSession", activeSessionSchema);
