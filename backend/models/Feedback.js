const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  psychicId: { type: mongoose.Schema.Types.ObjectId, ref: "AiPsychic", required: true },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: "Rating must be an integer between 1 and 5",
    },
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);