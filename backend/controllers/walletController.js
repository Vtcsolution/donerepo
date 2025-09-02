const Wallet = require("../models/Wallet");
const mongoose = require("mongoose");

exports.getWalletBalance = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        balance: 0,
        credits: 0,
      });
    }

    // Emit the balance to the user's room
    req.io.to(req.user._id.toString()).emit("walletUpdate", {
      credits: wallet.credits,
    });

    res.json({
      success: true,
      credits: wallet.credits,
    });
  } catch (error) {
    console.error("Error getting wallet credits:", error);
    res.status(500).json({
      success: false,
      error: "Error getting wallet credits",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.addCredits = async (req, res) => {
  try {
    const { userId, credits } = req.body;

    // Validate input
    if (!userId || !credits || credits <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid input: userId and positive credits amount are required",
      });
    }

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format",
      });
    }

    // Find or create wallet
    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0,
        credits: 0,
      });
    }

    // Update credits
    wallet.credits = (wallet.credits || 0) + parseFloat(credits);
    await wallet.save();

    // Emit the updated balance to the user's room
    req.io.to(userId).emit("walletUpdate", {
      credits: wallet.credits,
    });

    res.json({
      success: true,
      message: `Successfully added ${credits} credits to user ${userId}`,
      credits: wallet.credits,
    });
  } catch (error) {
    console.error("Error adding credits:", error);
    res.status(500).json({
      success: false,
      error: "Error adding credits",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.deductCredits = async (req, res) => {
  try {
    const { userId, credits } = req.body;

    // Validate input
    if (!userId || !credits || credits <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid input: userId and positive credits amount are required",
      });
    }

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format",
      });
    }

    // Find wallet
    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    // Check for sufficient credits
    if (wallet.credits < credits) {
      return res.status(400).json({
        success: false,
        error: "Insufficient credits",
      });
    }

    // Update credits
    wallet.credits -= parseFloat(credits);
    await wallet.save();

    // Emit the updated balance to the user's room
    req.io.to(userId).emit("walletUpdate", {
      credits: wallet.credits,
    });

    res.json({
      success: true,
      message: `Successfully deducted ${credits} credits from user ${userId}`,
      credits: wallet.credits,
    });
  } catch (error) {
    console.error("Error deducting credits:", error);
    res.status(500).json({
      success: false,
      error: "Error deducting credits",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};