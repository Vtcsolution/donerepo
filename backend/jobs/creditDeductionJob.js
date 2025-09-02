const schedule = require("node-schedule");
const ActiveSession = require("../models/ActiveSession");
const Wallet = require("../models/Wallet");
const User = require("../models/User");

const startCreditDeductionJob = (io) => {
  schedule.scheduleJob("*/1 * * * * *", async () => {
    try {
      const now = new Date();
      const sessions = await ActiveSession.find({
        paidSession: true,
        paidStartTime: { $exists: true },
        isArchived: false,
        lock: false,
      });

      for (const session of sessions) {
        // Lock session
        const sessionLock = await ActiveSession.findOneAndUpdate(
          { _id: session._id, lock: false },
          { $set: { lock: true } },
          { new: true }
        );

        if (!sessionLock) continue; // Skip if session is locked

        const wallet = await Wallet.findOneAndUpdate(
          { userId: session.userId, lock: false },
          { $set: { lock: true } },
          { new: true }
        );

        if (!wallet) {
          await ActiveSession.updateOne({ _id: session._id }, { $set: { lock: false } });
          console.error(`Wallet not found or locked for user ${session.userId}`);
          continue;
        }

        try {
          const secondsSinceStart = Math.floor((now - session.paidStartTime) / 1000);
          const minutesElapsed = Math.floor(secondsSinceStart / 60);
          const secondsIntoCurrentMinute = secondsSinceStart % 60;
          let expectedCredits = session.initialCredits - minutesElapsed;

          // Deduct credit at the start of each minute
          if (secondsIntoCurrentMinute === 1 && secondsSinceStart >= 1) {
            if (wallet.credits > expectedCredits) {
              wallet.credits = Math.max(0, expectedCredits);
              session.lastChargeTime = now;
              await wallet.save();
              await session.save();
              io.to(session.userId.toString()).emit("creditsUpdate", {
                userId: session.userId,
                credits: wallet.credits,
              });
              console.log(`Deducted 1 credit for user ${session.userId}, new credits: ${wallet.credits}`);
            }
          }

          const remainingTime = Math.max(0, session.initialCredits * 60 - secondsSinceStart);

          io.to(session.userId.toString()).emit("sessionUpdate", {
            userId: session.userId,
            psychicId: session.psychicId,
            isFree: false,
            remainingFreeTime: 0,
            paidTimer: remainingTime,
            credits: wallet.credits,
            status: remainingTime <= 0 ? "insufficient_credits" : "paid",
            showFeedbackModal: remainingTime <= 0,
            freeSessionUsed: true,
          });

          if (remainingTime <= 0) {
            session.paidSession = false;
            session.paidStartTime = null;
            session.isArchived = true;
            await wallet.save();
            await session.save();
            console.log(`Session terminated for user ${session.userId}, credits: ${wallet.credits}`);
          }
        } finally {
          // Release locks
          await ActiveSession.updateOne({ _id: session._id }, { $set: { lock: false } });
          await Wallet.updateOne({ userId: session.userId }, { $set: { lock: false } });
        }
      }
    } catch (error) {
      console.error("Credit deduction job error:", error);
    }
  });
};

const startFreeSessionTimerJob = (io) => {
  schedule.scheduleJob("*/1 * * * * *", async () => {
    try {
      const now = new Date();
      const sessions = await ActiveSession.find({
        freeSessionUsed: false,
        isArchived: false,
        lock: false,
      });

      for (const session of sessions) {
        // Lock session
        const sessionLock = await ActiveSession.findOneAndUpdate(
          { _id: session._id, lock: false },
          { $set: { lock: true } },
          { new: true }
        );

        if (!sessionLock) continue; // Skip if session is locked

        try {
          const user = await User.findById(session.userId);
          if (user.hasUsedFreeMinute) {
            session.freeSessionUsed = true;
            session.isArchived = true;
            await session.save();
            continue;
          }

          const remainingFreeTime = Math.max(0, Math.floor((session.freeEndTime - now) / 1000));
          session.remainingFreeTime = remainingFreeTime;
          if (remainingFreeTime <= 0) {
            session.freeSessionUsed = true;
            session.isArchived = true;
            await User.updateOne({ _id: session.userId }, { hasUsedFreeMinute: true });
          }
          await session.save();

          io.to(session.userId.toString()).emit("sessionUpdate", {
            userId: session.userId,
            psychicId: session.psychicId,
            isFree: remainingFreeTime > 0,
            remainingFreeTime,
            paidTimer: 0,
            credits: (await Wallet.findOne({ userId: session.userId }))?.credits || 0,
            status: remainingFreeTime > 0 ? "free" : "stopped",
            freeSessionUsed: user.hasUsedFreeMinute || session.freeSessionUsed,
            showFeedbackModal: remainingFreeTime <= 0,
          });

          if (remainingFreeTime <= 0) {
            console.log(`Free session ended for user ${session.userId}, psychic ${session.psychicId}`);
          }
        } finally {
          // Release session lock
          await ActiveSession.updateOne({ _id: session._id }, { $set: { lock: false } });
        }
      }
    } catch (error) {
      console.error("Free session timer job error:", error);
    }
  });
};

module.exports = { startCreditDeductionJob, startFreeSessionTimerJob };