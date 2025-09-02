const mongoose = require("mongoose");

const numerologyReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  numbers: {
    lifepath: { number: { type: Number, required: true }, description: { type: String, required: true } },
    expression: { number: { type: Number, required: true }, description: { type: String, required: true } },
    soulurge: { number: { type: Number, required: true }, description: { type: String, required: true } },
    personality: { number: { type: Number, required: true }, description: { type: String, required: true } },
  },
  narrative: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("NumerologyReport", numerologyReportSchema);