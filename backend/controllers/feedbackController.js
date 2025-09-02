
const Feedback = require("../models/Feedback");
const Wallet = require("../models/Wallet");
const mongoose = require("mongoose");

exports.submitFeedback = async (req, res) => {
  try {
    const { psychicId } = req.params;
    const { rating } = req.body;
    const userId = req.user?._id;

    // Validate inputs
    if (!userId || !psychicId || !mongoose.isValidObjectId(psychicId)) {
      return res.status(400).json({ error: "User ID and valid Psychic ID are required" });
    }

    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
    }

    // Create feedback
    const feedback = await Feedback.create({
      userId,
      psychicId,
      rating,
    });

    // Emit WebSocket event for feedback submission
    req.io.to(userId.toString()).emit("feedbackSubmitted", {
      userId,
      psychicId,
      rating,
      createdAt: feedback.createdAt,
    });

    res.status(201).json({
      success: true,
      feedback: {
        _id: feedback._id,
        rating: feedback.rating,
        createdAt: feedback.createdAt,
      },
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    res.status(500).json({
      error: "Failed to submit feedback",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Fetch feedback for a specific psychic by psychicId, optionally filtered by userId
exports.getFeedbackByPsychicId = async (req, res) => {
  try {
    const { psychicId } = req.params;
    const { userId } = req.query; // Optional userId from query parameter

    // Validate psychicId
    if (!psychicId || !mongoose.isValidObjectId(psychicId)) {
      return res.status(400).json({ error: "Valid Psychic ID is required" });
    }

    // Validate userId if provided
    if (userId && !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Valid User ID is required" });
    }

    // Build query
    const query = { psychicId };
    if (userId) {
      query.userId = userId;
    }

    // Fetch feedback with populated user username
    const feedback = await Feedback.find(query)
      .populate("userId", "username") // Populate userId with username field from User model
      .select("userId rating message gift createdAt")
      .lean();


    // If userId is provided, calculate user-specific rating
    let userFeedback = null;
    let userAverageRating = 0;
    let userFeedbackCount = 0;
    if (userId) {
      if (!feedback || feedback.length === 0) {
        userFeedback = [];
        userAverageRating = 0;
        userFeedbackCount = 0;
      } else {
        userFeedback = feedback.map((fb) => ({
          ...fb,
          userName: fb.userId?.username || "Anonymous", // Use populated username or fallback
        }));
        const totalUserRatings = feedback.reduce((sum, fb) => sum + fb.rating, 0);
        userFeedbackCount = feedback.length;
        userAverageRating = userFeedbackCount > 0 ? (totalUserRatings / userFeedbackCount).toFixed(2) : 0;
      }
    }

    // Fetch all feedback for the psychic (for overall stats)
    let overallFeedback = feedback;
    let overallAverageRating = userAverageRating;
    let overallFeedbackCount = userFeedbackCount;
    if (userId) {
      overallFeedback = await Feedback.find({ psychicId })
        .populate("userId", "username") // Populate userId with username field
        .select("userId rating message gift createdAt")
        .lean();
      overallFeedback = overallFeedback.map((fb) => ({
        ...fb,
        userName: fb.userId?.username || "Anonymous", // Use populated username or fallback
      }));
      const totalOverallRatings = overallFeedback.reduce((sum, fb) => sum + fb.rating, 0);
      overallFeedbackCount = overallFeedback.length;
      overallAverageRating = overallFeedbackCount > 0 ? (totalOverallRatings / overallFeedbackCount).toFixed(2) : 0;
    } else {
      overallFeedback = feedback.map((fb) => ({
        ...fb,
        userName: fb.userId?.username || "Anonymous", // Use populated username or fallback
      }));
    }

    if (!overallFeedback || overallFeedback.length === 0) {
      return res.status(404).json({ error: "No feedback found for this psychic" });
    }

    // Prepare response
    const response = {
      success: true,
      overall: {
        feedback: overallFeedback,
        averageRating: overallAverageRating,
        feedbackCount: overallFeedbackCount,
      },
    };

    if (userId) {
      response.user = {
        feedback: userFeedback,
        averageRating: userAverageRating,
        feedbackCount: userFeedbackCount,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching feedback by psychicId:", error);
    res.status(500).json({
      error: "Failed to fetch feedback",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Fetch all feedback across all psychics
exports.getAllFeedback = async (req, res) => {
  try {
    // Fetch all feedback with populated user username
    const feedback = await Feedback.find()
      .populate("userId", "username") // Populate userId with username field
      .select("userId psychicId rating message gift createdAt")
      .lean();

    // Debug log to verify populated data
    console.log("All feedback:", feedback);

    if (!feedback || feedback.length === 0) {
      return res.status(404).json({ error: "No feedback found" });
    }

    // Group by psychicId and calculate average ratings per psychic
    const feedbackByPsychic = feedback.reduce((acc, fb) => {
      const psychicId = fb.psychicId.toString();
      if (!acc[psychicId]) {
        acc[psychicId] = { feedback: [], totalRatings: 0, count: 0 };
      }
      acc[psychicId].feedback.push({
        ...fb,
        userName: fb.userId?.username || "Anonymous", // Use populated username or fallback
      });
      acc[psychicId].totalRatings += fb.rating;
      acc[psychicId].count += 1;
      return acc;
    }, {});

    const feedbackSummary = Object.keys(feedbackByPsychic).map((psychicId) => ({
      psychicId,
      feedback: feedbackByPsychic[psychicId].feedback,
      averageRating: (feedbackByPsychic[psychicId].totalRatings / feedbackByPsychic[psychicId].count).toFixed(2),
      feedbackCount: feedbackByPsychic[psychicId].count,
    }));

    res.status(200).json({
      success: true,
      feedback: feedbackSummary,
      totalFeedbackCount: feedback.length,
    });
  } catch (error) {
    console.error("Error fetching all feedback:", error);
    res.status(500).json({
      error: "Failed to fetch all feedback",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
