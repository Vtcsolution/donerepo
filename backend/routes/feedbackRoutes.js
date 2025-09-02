const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { submitFeedback, getFeedbackByPsychicId, getAllFeedback } = require("../controllers/feedbackController");

// Submit feedback for a psychic
router.post("/feedback/:psychicId", protect, submitFeedback);

// Fetch feedback for a specific psychic
router.get("/feedback/psychic/:psychicId", protect, getFeedbackByPsychicId);

// Fetch all feedback across all psychics
router.get("/feedback/all", protect, getAllFeedback);

module.exports = router;