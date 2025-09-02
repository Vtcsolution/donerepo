const mongoose = require("mongoose");

const monthlyForecastReportSchema = new mongoose.Schema({
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
    sun: {
      sign: { type: String, required: true },
      description: { type: String, required: true },
    },
    moon: {
      sign: { type: String, required: true },
      description: { type: String, required: true },
    },
    ascendant: {
      sign: { type: String, required: true },
      description: { type: String, required: true },
    },
  },
  forecast: {
    overview: { type: String, required: true },
    career: { type: String },
    relationships: { type: String },
    personalGrowth: { type: String },
    challenges: { type: String },
  },
  predictionMonth: {
    type: Number,
    required: true,
  },
  predictionYear: {
    type: Number,
    required: true,
  },
  transits: [
  {
    planet: { type: String, required: true },
    sign: { type: String, required: false, default: "Unknown" },
    house: { type: String, required: false, default: "Unknown" },
    aspect: { type: String, required: false, default: "Unknown" },
    natalPlanet: { type: String, required: false, default: "Unknown" },
    date: { type: String, required: false, default: "Unknown" },
    description: { type: String, required: false, default: "No specific transit details available." },
  },
],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MonthlyForecastReport", monthlyForecastReportSchema);