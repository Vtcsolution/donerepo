const mongoose = require("mongoose");
const ActiveSession = require("../models/ActiveSession");
const Wallet = require("../models/Wallet");
const User = require("../models/User");

const freeMinutes = 1;

const checkAndUpdateTimer = async (userId, psychicId) => {
  const now = new Date();
  const user = await User.findById(userId);

  // Check if user has a free minute
  if (!user.hasUsedFreeMinute) {
    let session = await ActiveSession.findOne({ userId, psychicId });

    if (!session) {
      session = await ActiveSession.create({
        userId,
        psychicId,
        startTime: now,
        freeEndTime: new Date(now.getTime() + freeMinutes * 60000),
        remainingFreeTime: freeMinutes * 60,
        lastChargeTime: now,
        freeSessionUsed: false,
        isArchived: false,
      });
    }

    if (now < session.freeEndTime) {
      return { available: true, isFree: true, message: "Free minute active" };
    }

    // Mark free minute as used
    await User.updateOne({ _id: userId }, { hasUsedFreeMinute: true });
    session.freeSessionUsed = true;
    session.isArchived = true;
    await session.save();
  }

  // Check wallet for paid session
  const wallet = await Wallet.findOne({ userId });
  if (!wallet || wallet.credits <= 0) {
    return { available: false, message: "Purchase credits to continue chatting." };
  }

  let session = await ActiveSession.findOne({ userId, psychicId });
  if (!session) {
    session = await ActiveSession.create({
      userId,
      psychicId,
      startTime: now,
      lastChargeTime: now,
      freeSessionUsed: true,
      isArchived: false,
    });
  }

  // Skip credit deduction if paid session is already active
  if (session.paidSession && session.paidStartTime) {
    const secondsSinceStart = Math.floor((now - session.paidStartTime) / 1000);
    const remainingTime = Math.max(0, session.initialCredits * 60 - secondsSinceStart);
    if (remainingTime <= 0) {
      await ActiveSession.updateOne(
        { _id: session._id },
        { paidSession: false, paidStartTime: null, isArchived: true }
      );
      return { available: false, message: "Purchase credits to continue chatting." };
    }
    return { available: true, isFree: false, remainingTime };
  }

  // Deduct credits for new paid session
  const minutesToCharge = Math.ceil((now - session.lastChargeTime) / 60000);
  if (minutesToCharge >= 1) {
    if (wallet.credits < minutesToCharge) {
      return { available: false, message: "Purchase credits to continue chatting." };
    }
    await Wallet.updateOne(
      { userId, lock: false },
      { $inc: { credits: -minutesToCharge }, $set: { lock: false } }
    );
    session.lastChargeTime = new Date(session.lastChargeTime.getTime() + minutesToCharge * 60000);
    await session.save();
  }

  return { available: true, isFree: false };
};

module.exports = { checkAndUpdateTimer };