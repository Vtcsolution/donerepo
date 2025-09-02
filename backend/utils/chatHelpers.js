const Wallet = require("../models/Wallet");
const ChatMessage = require("../models/chatMessage");

// Deduct 1 credit
exports.deductCredit = async (userId) => {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet || wallet.credits < 1) return false;
  wallet.credits -= 1;
  await wallet.save();
  return true;
};

// Save chat message
exports.saveMessage = async (userId, psychicId, text, sender) => {
  await ChatMessage.findOneAndUpdate(
    { userId, psychicId },
    { $push: { messages: { text, sender } } },
    { upsert: true, new: true }
  );
};

// Calculate minutes from timestamp
exports.minutesBetween = (start, end) => {
  return Math.floor((end - start) / 60000);
};
