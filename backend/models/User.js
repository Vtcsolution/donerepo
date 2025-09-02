const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  image: { type: String, default: "" },
  gender: { type: String, enum: ['male', 'female'], required: true },
  password: { type: String, required: true, minlength: 6 },
  dob: { type: Date, required: true },
  birthTime: { type: String, },
  birthPlace: { type: String, required: true, },
  bio: { type: String, trim: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hasRequestedFreeReport: { type: Boolean, default: false },
  hasUsedFreeMinute: { type: Boolean, default: false }, // Tracks single free minute globally
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);