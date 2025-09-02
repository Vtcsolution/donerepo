const AiPsychic = require("../models/aiPsychic");
const ChatMessage = require("../models/chatMessage"); // adjust path if needed
const Feedback = require("../models/Feedback");
const mongoose = require ("mongoose")
// Add AI Psychic
const addAiPsychic = async (req, res) => {
  try {
    const { name, type, image, bio, systemPrompt, rate, abilities } = req.body;

    const newPsychic = new AiPsychic({
      name,
      type,
      image,
      bio ,
      systemPrompt,
      rate,
      abilities: Array.isArray(abilities)
        ? abilities
        : abilities.split(",").map((a) => a.trim()).filter((a) => a),
    });

    await newPsychic.save();
    res.status(201).json({ success: true, data: newPsychic });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// Get Detailed AI Psychic Profile (Public Access)
const getAiPsychicDetailedProfile = async (req, res) => {
  try {
    const { psychicId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(psychicId)) {
      return res.status(400).json({ success: false, message: "Invalid psychic ID" });
    }

    // Fetch psychic details
    const psychic = await AiPsychic.findById(psychicId).lean();
    if (!psychic) {
      return res.status(404).json({ success: false, message: "Psychic not found" });
    }

    // Fetch feedback with userName
    const feedback = await Feedback.find({ psychicId })
      .populate("userId", "username")
      .sort({ createdAt: -1 })
      .lean();

    const feedbackData = feedback.map(f => ({
      userName: f.userId?.username || "Anonymous",
      rating: f.rating,
      message: f.message,
      gift: f.gift,
      createdAt: f.createdAt,
    }));

    const feedbackCount = feedback.length;
    const averageRating = feedbackCount
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedbackCount).toFixed(1)
      : 0;

    // Fetch chat statistics
    const chatStats = await ChatMessage.aggregate([
      { $match: { psychicId: new mongoose.Types.ObjectId(psychicId) } },
      {
        $group: {
          _id: "$sessionId",
          messages: { $sum: 1 },
          startTime: { $min: "$createdAt" },
          endTime: { $max: "$createdAt" },
        },
      },
      {
        $group: {
          _id: null,
          totalChats: { $sum: 1 },
          totalMessages: { $sum: "$messages" },
          totalDuration: {
            $sum: { $subtract: ["$endTime", "$startTime"] },
          },
        },
      },
      {
        $project: {
          totalChats: 1,
          totalMessages: 1,
          averageDuration: {
            $cond: [
              { $gt: ["$totalChats", 0] },
              { $divide: ["$totalDuration", "$totalChats"] },
              0,
            ],
          },
        },
      },
    ]);

    const stats = chatStats[0] || {
      totalChats: 0,
      totalMessages: 0,
      averageDuration: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        psychic: {
          ...psychic,
          rating: {
            averageRating: parseFloat(averageRating),
            feedbackCount,
          },
          feedback: feedbackData,
          chatStats: {
            totalChats: stats.totalChats,
            totalMessages: stats.totalMessages,
            averageSessionDuration: Math.round(stats.averageDuration / 1000 / 60), // Convert ms to minutes
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching AI psychic profile:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all AI Psychics
const getAllAiPsychics = async (req, res) => {
  try {
    const psychics = await AiPsychic.find();
    res.status(200).json({ success: true, data: psychics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single AI Psychic by ID
const getAiPsychicById = async (req, res) => {
  try {
    const psychic = await AiPsychic.findById(req.params.id);
    if (!psychic) {
      return res.status(404).json({ success: false, message: "Psychic not found" });
    }
    res.status(200).json({ success: true, data: psychic });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get available categories
const getPsychicCategories = async (req, res) => {
     const categories = await AiPsychic.distinct("type");

  try {
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


const getAiPsychicsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: Find all unique psychicIds from chat history for the user
    const chats = await ChatMessage.find({ userId }).select("psychicId");

    const psychicIds = [...new Set(chats.map(chat => chat.psychicId.toString()))];

    if (psychicIds.length === 0) {
      return res.status(200).json({ success: true, data: [] }); // no chats yet
    }

    // Step 2: Get AI Psychics by those IDs
    const psychics = await AiPsychic.find({ _id: { $in: psychicIds } });

    res.status(200).json({ success: true, data: psychics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// controllers/aiPsychicController.js
const updateAiPsychic = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert abilities string to array if needed
    if (updateData.abilities && typeof updateData.abilities === 'string') {
      updateData.abilities = updateData.abilities
        .split(',')
        .map(a => a.trim())
        .filter(a => a);
    }

    const updatedPsychic = await AiPsychic.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedPsychic) {
      return res.status(404).json({ success: false, message: "Psychic not found" });
    }

    res.status(200).json({ success: true, data: updatedPsychic });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete AI Psychic by ID
const deleteAiPsychic = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPsychic = await AiPsychic.findByIdAndDelete(id);

    if (!deletedPsychic) {
      return res.status(404).json({ success: false, message: "Psychic not found" });
    }

    res.status(200).json({ success: true, message: "Psychic deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAiPsychicsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!type) {
      return res.status(400).json({ success: false, message: "Type is required" });
    }

    const psychics = await AiPsychic.find({ type: { $regex: new RegExp(type, "i") } });

    if (!psychics || psychics.length === 0) {
      return res.status(404).json({ success: false, message: "No psychics found for this type" });
    }

    res.status(200).json({ success: true, data: psychics });
  } catch (error) {
    console.error("getAiPsychicsByType error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


module.exports = {
  addAiPsychic,
  getAllAiPsychics,
  getAiPsychicById,
  getPsychicCategories,
  getAiPsychicsByUserId,
  updateAiPsychic, 
  deleteAiPsychic,
  getAiPsychicsByType,
  getAiPsychicDetailedProfile
};
