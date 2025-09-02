const mongoose = require("mongoose");

const astrologyReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  chart: {
    sun: {
      sign: { type: String, required: true },
      house: { type: String, required: true },
      description: { type: String, required: true },
    },
    moon: {
      sign: { type: String, required: true },
      house: { type: String, required: true },
      description: { type: String, required: true },
    },
    venus: {
      sign: { type: String, required: true },
      house: { type: String, required: true },
      description: { type: String, required: true },
    },
    mars: {
      sign: { type: String, required: true },
      house: { type: String, required: true },
      description: { type: String, required: true },
    },
    mercury: {
      sign: { type: String, required: true },
      house: { type: String, required: true },
      description: { type: String, required: true },
    },
    jupiter: {
      sign: { type: String, required: true },
      house: { type: String, required: true },
      description: { type: String, required: true },
    },
    saturn: {
      sign: { type: String, required: true },
      house: { type: String, required: true },
      description: { type: String, required: true },
    },
    ascendant: {
      // Add ascendant field
      sign: { type: String, required: true },
      house: { type: String, default: "1" }, // Ascendant is always in 1st house
      description: { type: String, required: true },
    },
  },
  numerology: {
    lifePath: {
      number: { type: Number, required: true },
      description: { type: String, required: true },
    },
    heart: {
      number: { type: Number, required: true },
      description: { type: String, required: true },
    },
    expression: {
      number: { type: Number, required: true },
      description: { type: String, required: true },
    },
    personality: {
      number: { type: Number, required: true },
      description: { type: String, required: true },
    },
  },
  narrative: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AstrologyReport", astrologyReportSchema);