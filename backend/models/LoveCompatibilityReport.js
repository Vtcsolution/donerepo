const mongoose = require("mongoose");

const loveCompatibilityReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  narrative: {
    type: String,
    required: true,
  },
  chart: {
    user: {
      sun: { sign: String, house: String, description: String, combined: String },
      moon: { sign: String, house: String, description: String, combined: String },
      venus: { sign: String, house: String, description: String, combined: String },
      mars: { sign: String, house: String, description: String, combined: String },
      mercury: { sign: String, house: String, description: String, combined: String },
      jupiter: { sign: String, house: String, description: String, combined: String },
      saturn: { sign: String, house: String, description: String, combined: String },
      ascendant: { sign: String, description: String },
    },
    partner: {
      sun: { sign: String, house: String, description: String, combined: String },
      moon: { sign: String, house: String, description: String, combined: String },
      venus: { sign: String, house: String, description: String, combined: String },
      mars: { sign: String, house: String, description: String, combined: String },
      mercury: { sign: String, house: String, description: String, combined: String },
      jupiter: { sign: String, house: String, description: String, combined: String },
      saturn: { sign: String, house: String, description: String, combined: String },
      ascendant: { sign: String, description: String },
    },
  },
  yourName: {
    type: String,
    required: true,
  },
  partnerName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("LoveCompatibilityReport", loveCompatibilityReportSchema);