const mongoose = require("mongoose");

const aiFormDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["Astrology", "Numerology", "Love", "Tarot"],
    required: true // store by type
  },
  formData: {
    type: Object,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("AiFormData", aiFormDataSchema);
