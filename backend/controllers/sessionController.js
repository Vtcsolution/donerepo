const ActiveSession = require("../models/ActiveSession");
const Wallet = require("../models/Wallet");

exports.startPaidSession = async (req, res) => {
  const { psychicId } = req.params;
  const userId = req.user._id;

  try {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.credits < 1) {
      return res.status(400).json({ success: false, message: "Not enough credits." });
    }

    let session = await ActiveSession.findOne({ userId, psychicId });
    if (!session) {
      const now = new Date();
      session = await ActiveSession.create({
        userId,
        psychicId,
        startTime: now,
        freeEndTime: new Date(now.getTime() + 60 * 1000),
        lastChargeTime: now,
        freeSessionUsed: true, // Mark free session as used when starting paid
        isArchived: false,
      });
    }

    if (session.paidSession) {
      return res.status(400).json({ success: false, message: "Paid session already active." });
    }

    session.paidSession = true;
    session.paidStartTime = new Date();
    session.initialCredits = wallet.credits;
    session.freeSessionUsed = true;
    session.isArchived = false;
    await session.save();

    res.json({ success: true, message: "Paid session started.", credits: wallet.credits, paidTimer: wallet.credits * 60 });
  } catch (error) {
    console.error("Start paid session error:", error);
    res.status(500).json({ success: false, message: "Failed to start paid session." });
  }
};

exports.stopPaidSession = async (req, res) => {
  const { psychicId } = req.params;
  const userId = req.user._id;

  try {
    const session = await ActiveSession.findOne({ userId, psychicId });
    if (!session || !session.paidSession) {
      return res.status(400).json({ success: false, message: "No active paid session." });
    }

    const wallet = await Wallet.findOne({ userId });
    const secondsSinceStart = Math.floor((new Date() - session.paidStartTime) / 1000);
    const creditsToDeduct = Math.floor(secondsSinceStart / 60);
    wallet.credits = Math.max(0, session.initialCredits - creditsToDeduct);
    await wallet.save();

    session.paidSession = false;
    session.paidStartTime = null;
    session.isArchived = true;
    await session.save();

    res.json({ success: true, message: "Paid session stopped.", credits: wallet.credits });
  } catch (error) {
    console.error("Stop paid session error:", error);
    res.status(500).json({ success: false, message: "Failed to stop paid session." });
  }
};