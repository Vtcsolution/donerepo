const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  message: { type: String, required: true, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // optional link to User
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
