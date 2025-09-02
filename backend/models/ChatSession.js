const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  psychicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AiPsychic",
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ["free", "paid"],
    required: true,
  },
  endedAt: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("ChatSession", chatSessionSchema);
