const ActiveSession = require("../models/ActiveSession");
const Wallet = require("../models/Wallet");

const checkAndUpdateTimer = async (req, res, next) => {
  const { psychicId } = req.params;
  const userId = req.user?._id;
  const now = new Date();

  try {
    let session = await ActiveSession.findOne({ userId, psychicId });

    if (session && !session.freeSessionUsed && now >= session.freeEndTime) {
      session.freeSessionUsed = true;
      session.remainingFreeTime = 0;
      session.isArchived = true;
      await session.save();
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.credits <= 0) {
      return res.status(400).json({ error: "Not enough credits" });
    }

    next();
  } catch (error) {
    console.error("Timer middleware error:", error);
    res.status(500).json({ error: "Failed to check timer" });
  }
};

module.exports = { checkAndUpdateTimer };