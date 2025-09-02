const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { checkAndUpdateTimer } = require("../middleware/timerMiddleware");
const ActiveSession = require("../models/ActiveSession");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const mongoose = require("mongoose");

const freeMinutes = 1;

// Session Status Endpoint (unchanged)
router.get("/session-status/:psychicId", protect, async (req, res) => {
  try {
    const { psychicId } = req.params;
    const userId = req.user?._id;

    if (!userId || !mongoose.isValidObjectId(psychicId)) {
      return res.status(400).json({ error: "Invalid user or psychic ID" });
    }

    const user = await User.findById(userId);
    let session = await ActiveSession.findOne({ userId, psychicId });
    const wallet = await Wallet.findOne({ userId });
    const now = new Date();

    if (user.hasUsedFreeMinute) {
      return res.json({
        isFree: false,
        remainingFreeTime: 0,
        paidTimer: session?.paidSession && session.paidStartTime
          ? Math.max(0, session.initialCredits * 60 - Math.floor((now - session.paidStartTime) / 1000))
          : 0,
        credits: wallet?.credits || 0,
        status: session?.paidSession ? "paid" : "stopped",
        freeSessionUsed: true,
      });
    }

    if (!session) {
      return res.json({
        isFree: true,
        remainingFreeTime: freeMinutes * 60,
        paidTimer: 0,
        credits: wallet?.credits || 0,
        status: "new",
        freeSessionUsed: false,
      });
    }

    const isFree = !session.freeSessionUsed && session.remainingFreeTime > 0;
    const paidTimer = session.paidSession && session.paidStartTime
      ? Math.max(0, session.initialCredits * 60 - Math.floor((now - session.paidStartTime) / 1000))
      : 0;

    res.json({
      isFree,
      remainingFreeTime: session.remainingFreeTime || 0,
      paidTimer,
      credits: wallet?.credits || 0,
      status: isFree ? "free" : session.paidSession ? "paid" : "stopped",
      freeSessionUsed: user.hasUsedFreeMinute || session.freeSessionUsed,
    });
  } catch (error) {
    console.error("Session status error:", error);
    res.status(500).json({ error: "Failed to get session status" });
  }
});

// Start Free Session Endpoint (unchanged)
router.post("/start-free-session/:psychicId", protect, async (req, res) => {
  try {
    const { psychicId } = req.params;
    const userId = req.user?._id;

    if (!userId || !mongoose.isValidObjectId(psychicId)) {
      return res.status(400).json({ error: "Invalid user or psychic ID" });
    }

    const user = await User.findById(userId);
    if (user.hasUsedFreeMinute) {
      return res.status(400).json({ error: "Free minute already used" });
    }

    let session = await ActiveSession.findOne({ userId, psychicId });
    if (session && session.freeSessionUsed) {
      return res.status(400).json({ error: "Free session already used for this psychic" });
    }

    const now = new Date();
    if (!session) {
      session = await ActiveSession.create({
        userId,
        psychicId,
        startTime: now,
        freeEndTime: new Date(now.getTime() + freeMinutes * 60 * 1000),
        remainingFreeTime: freeMinutes * 60,
        lastChargeTime: now,
        paidSession: false,
        freeSessionUsed: false,
        isArchived: false,
        lock: false,
      });
    } else if (session.remainingFreeTime <= 0) {
      session.freeSessionUsed = true;
      await User.updateOne({ _id: userId }, { hasUsedFreeMinute: true });
      await session.save();
      return res.status(400).json({ error: "Free minute already used" });
    }

    const wallet = await Wallet.findOne({ userId });

    res.json({
      success: true,
      isFree: true,
      remainingFreeTime: session.remainingFreeTime,
      paidTimer: 0,
      credits: wallet?.credits || 0,
      status: "free",
      freeSessionUsed: user.hasUsedFreeMinute,
    });

    req.io.to(userId.toString()).emit("sessionUpdate", {
      userId,
      psychicId,
      isFree: true,
      remainingFreeTime: session.remainingFreeTime,
      paidTimer: 0,
      credits: wallet?.credits || 0,
      status: "free",
      freeSessionUsed: user.hasUsedFreeMinute,
    });
  } catch (error) {
    console.error("Start free session error:", error);
    res.status(500).json({ error: "Failed to start free session" });
  }
});

// Start Paid Session Endpoint
router.post("/start-paid-session/:psychicId", protect, checkAndUpdateTimer, async (req, res) => {
  try {
    const { psychicId } = req.params;
    const userId = req.user?._id;

    if (!userId || !mongoose.isValidObjectId(psychicId)) {
      return res.status(400).json({ error: "Invalid user or psychic ID" });
    }

    // Lock wallet to prevent concurrent updates
    const wallet = await Wallet.findOneAndUpdate(
      { userId, lock: false },
      { $set: { lock: true } },
      { new: true }
    );

    if (!wallet) {
      return res.status(400).json({ error: "Wallet locked or not found" });
    }

    try {
      if (wallet.credits < 1) {
        return res.status(400).json({ error: "Not enough credits" });
      }

      // Check for existing paid session with this psychic
      const existingSession = await ActiveSession.findOne({
        userId,
        psychicId,
        paidSession: true,
        isArchived: false,
      });

      if (existingSession) {
        return res.status(400).json({ error: "Paid session already active with this psychic" });
      }

      // Stop other paid sessions
      const otherPaidSessions = await ActiveSession.find({
        userId,
        paidSession: true,
        psychicId: { $ne: psychicId },
        isArchived: false,
      });

      for (const otherSession of otherPaidSessions) {
        const sessionLock = await ActiveSession.findOneAndUpdate(
          { _id: otherSession._id, lock: false },
          { $set: { lock: true } },
          { new: true }
        );

        if (!sessionLock) continue; // Skip if session is locked

        const secondsSinceStart = Math.floor((new Date() - otherSession.paidStartTime) / 1000);
        const creditsToDeduct = Math.ceil(secondsSinceStart / 60);
        wallet.credits = Math.max(0, otherSession.initialCredits - creditsToDeduct);

        await ActiveSession.updateOne(
          { _id: otherSession._id },
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

        req.io.to(userId.toString()).emit("sessionUpdate", {
          userId,
          psychicId: otherSession.psychicId,
          isFree: false,
          remainingFreeTime: 0,
          paidTimer: 0,
          credits: wallet.credits,
          status: "stopped",
          showFeedbackModal: true,
        });
      }

      // Start new session
      let currentSession = await ActiveSession.findOne({ userId, psychicId });
      const now = new Date();

      if (!currentSession) {
        currentSession = await ActiveSession.create({
          userId,
          psychicId,
          startTime: now,
          freeEndTime: new Date(now.getTime() + freeMinutes * 60 * 1000),
          remainingFreeTime: 0,
          lastChargeTime: now,
          paidSession: true,
          paidStartTime: now,
          initialCredits: wallet.credits,
          freeSessionUsed: true,
          isArchived: false,
          lock: false,
        });
      } else {
        const sessionLock = await ActiveSession.findOneAndUpdate(
          { userId, psychicId, lock: false },
          {
            $set: {
              paidSession: true,
              paidStartTime: now,
              initialCredits: wallet.credits,
              freeSessionUsed: true,
              remainingFreeTime: 0,
              isArchived: false,
              lock: true,
            },
          },
          { new: true }
        );

        if (!sessionLock) {
          return res.status(400).json({ error: "Session is locked, try again" });
        }

        currentSession = sessionLock;
      }

      const paidTimer = wallet.credits * 60;

      res.json({
        success: true,
        isFree: false,
        remainingFreeTime: 0,
        paidTimer,
        credits: wallet.credits,
        status: "paid",
        freeSessionUsed: true,
      });

      req.io.to(userId.toString()).emit("sessionUpdate", {
        userId,
        psychicId,
        isFree: false,
        remainingFreeTime: 0,
        paidTimer,
        credits: wallet.credits,
        status: "paid",
        freeSessionUsed: true,
      });

      // Release session lock
      await ActiveSession.updateOne({ _id: currentSession._id }, { $set: { lock: false } });
    } finally {
      // Release wallet lock
      await Wallet.updateOne({ userId }, { $set: { lock: false } });
    }
  } catch (error) {
    console.error("Start paid session error:", error);
    // Ensure wallet lock is released on error
    await Wallet.updateOne({ userId }, { $set: { lock: false } });
    res.status(500).json({ error: "Failed to start paid session" });
  }
});

// Stop Paid Session Endpoint
router.post("/stop-session/:psychicId", protect, async (req, res) => {
  try {
    const { psychicId } = req.params;
    const userId = req.user?._id;

    if (!userId || !mongoose.isValidObjectId(psychicId)) {
      return res.status(400).json({ error: "Invalid user or psychic ID" });
    }

    // Lock wallet
    const wallet = await Wallet.findOneAndUpdate(
      { userId, lock: false },
      { $set: { lock: true } },
      { new: true }
    );

    if (!wallet) {
      return res.status(400).json({ error: "Wallet locked or not found" });
    }

    try {
      // Lock session
      const currentSession = await ActiveSession.findOneAndUpdate(
        { userId, psychicId, lock: false, paidSession: true, isArchived: false },
        { $set: { lock: true } },
        { new: true }
      );

      if (!currentSession) {
        return res.status(400).json({ error: "No active paid session found or session is locked" });
      }

      const secondsSinceStart = Math.floor((new Date() - currentSession.paidStartTime) / 1000);
      const creditsToDeduct = Math.ceil(secondsSinceStart / 60);
      wallet.credits = Math.max(0, currentSession.initialCredits - creditsToDeduct);
      const remainingTime = Math.max(0, currentSession.initialCredits * 60 - secondsSinceStart);

      await ActiveSession.updateOne(
        { _id: currentSession._id },
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

      res.json({
        success: true,
        isFree: false,
        remainingFreeTime: 0,
        paidTimer: remainingTime,
        credits: wallet.credits,
        status: "stopped",
        showFeedbackModal: true,
        freeSessionUsed: true,
      });

      req.io.to(userId.toString()).emit("sessionUpdate", {
        userId,
        psychicId,
        isFree: false,
        remainingFreeTime: 0,
        paidTimer: remainingTime,
        credits: wallet.credits,
        status: "stopped",
        showFeedbackModal: true,
        freeSessionUsed: true,
      });
    } finally {
      // Release wallet lock
      await Wallet.updateOne({ userId }, { $set: { lock: false } });
    }
  } catch (error) {
    console.error("Stop session error:", error);
    // Ensure wallet lock is released on error
    await Wallet.updateOne({ userId }, { $set: { lock: false } });
    res.status(500).json({ error: "Failed to stop session" });
  }
});

module.exports = router;