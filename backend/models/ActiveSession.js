const mongoose = require("mongoose");

const activeSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  psychicId: { type: mongoose.Schema.Types.ObjectId, ref: "AiPsychic", required: true },
  startTime: { type: Date, required: true },
  freeEndTime: { type: Date, required: true },
  remainingFreeTime: { type: Number, default: 60 }, // Store remaining free seconds
  lastChargeTime: { type: Date, required: true },
  paidSession: { type: Boolean, default: false },
  paidStartTime: { type: Date },
  freeSessionUsed: { type: Boolean, default: false },
  initialCredits: { type: Number, default: null },
  isArchived: { type: Boolean, default: false },
  lock: { type: Boolean, default: false }, // New field to prevent concurrent updates
}, { timestamps: true });

activeSessionSchema.index({ userId: 1, psychicId: 1 }, { unique: true });

module.exports = mongoose.model("ActiveSession", activeSessionSchema);