const mongoose = require("mongoose");

const aiPsychicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ["Astrology", "Numerology", "Love", "Tarot"],
    required: true, // Determines form config automatically
  },
  image: { type: String, required: true },
  bio: { type: String, trim: true },
  systemPrompt: { type: String, required: true },
  rate: {
    perMinute: { type: Number, default: 0 },
    perMessage: { type: Number, default: 0 }
  },
  abilities: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("AiPsychic", aiPsychicSchema);
