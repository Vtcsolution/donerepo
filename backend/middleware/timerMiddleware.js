const mongoose = require("mongoose");
const ActiveSession = require("../models/ActiveSession");
const Wallet = require("../models/Wallet");

const checkAndUpdateTimer = async (req, res, next) => {
  const { psychicId } = req.params;
  const userId = req.user?._id;
  const now = new Date();

  try {
    if (!userId || !mongoose.isValidObjectId(psychicId)) {
      return res.status(400).json({ error: "Invalid user or psychic ID" });
    }

    // Lock wallet to prevent concurrent updates
    let wallet = await Wallet.findOneAndUpdate(
      { userId, lock: false },
      { $set: { lock: true } },
      { new: true }
    );

    if (!wallet) {
      return res.status(400).json({ error: "Wallet locked or not found" });
    }

    try {
      let session = await ActiveSession.findOne({ userId, psychicId });

      // Handle free session expiration
      if (session && !session.freeSessionUsed && now >= session.freeEndTime) {
        session.freeSessionUsed = true;
        session.remainingFreeTime = 0;
        session.isArchived = true;
        await session.save();
        req.io.to(userId.toString()).emit("sessionUpdate", {
          userId,
          psychicId,
          isFree: false,
          remainingFreeTime: 0,
          paidTimer: 0,
          credits: wallet.credits,
          status: "stopped",
          freeSessionUsed: true,
        });
      }

      // Handle paid session credit deduction
      if (session && session.paidSession && session.paidStartTime) {
        // Lock session to prevent concurrent updates
        session = await ActiveSession.findOneAndUpdate(
          { _id: session._id, lock: false },
          { $set: { lock: true } },
          { new: true }
        );

        if (!session) {
          return res.status(400).json({ error: "Session locked, try again" });
        }

        try {
          const secondsSinceStart = Math.floor((now - session.paidStartTime) / 1000);
          const totalCredits = session.initialCredits;
          const secondsPerCredit = 60;

          // Calculate remaining time
          const remainingTime = Math.max(0, totalCredits * secondsPerCredit - secondsSinceStart);

          // Calculate credits to deduct (only after a full minute)
          const creditsToDeduct = Math.floor(secondsSinceStart / secondsPerCredit);
          const remainingCredits = Math.max(0, totalCredits - creditsToDeduct);

          // Check if credits changed
          let creditsChanged = false;
          if (wallet.credits !== remainingCredits) {
            wallet.credits = remainingCredits;
            creditsChanged = true;
          }

          // Stop session only when remaining time is exactly 0
          if (remainingTime === 0 && wallet.credits > 0) {
            wallet.credits = Math.max(0, wallet.credits - 1); // Deduct final credit
            creditsChanged = true;

            await ActiveSession.updateOne(
              { _id: session._id },
              {
                $set: {
                  paidSession: false,
                  paidStartTime: null,
                  isArchived: true,
                  lock: false,
                },
              }
            );

            await wallet.save();

            // Emit session update to notify client
            req.io.to(userId.toString()).emit("sessionUpdate", {
              userId,
              psychicId,
              isFree: false,
              remainingFreeTime: 0,
              paidTimer: 0,
              credits: wallet.credits,
              status: "stopped",
              showFeedbackModal: true,
              freeSessionUsed: true,
            });

            return res.status(400).json({ error: "Insufficient credits or session ended" });
          }

          // Emit session update if credits changed or to sync timer
          if (creditsChanged || remainingTime > 0) {
            await wallet.save();
            req.io.to(userId.toString()).emit("sessionUpdate", {
              userId,
              psychicId,
              isFree: false,
              remainingFreeTime: 0,
              paidTimer: remainingTime,
              credits: wallet.credits,
              status: "paid",
              freeSessionUsed: true,
            });
          }

          // Update lastChargeTime to track the last deduction
          await ActiveSession.updateOne(
            { _id: session._id },
            { $set: { lastChargeTime: now, lock: false } }
          );
        } finally {
          // Release session lock
          await ActiveSession.updateOne({ _id: session._id }, { $set: { lock: false } });
        }
      }

      // Check if wallet has enough credits to continue or start a paid session
      if (!session || !session.paidSession) {
        if (!wallet || wallet.credits <= 0) {
          return res.status(400).json({ error: "Not enough credits" });
        }
      }

      next();
    } finally {
      // Release wallet lock
      await Wallet.updateOne({ userId }, { $set: { lock: false } });
    }
  } catch (error) {
    console.error("Timer middleware error:", error);
    // Ensure wallet lock is released on error
    await Wallet.updateOne({ userId }, { $set: { lock: false } });
    res.status(500).json({ error: "Failed to check timer" });
  }
};

module.exports = { checkAndUpdateTimer };
