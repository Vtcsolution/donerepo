const express = require("express");
const router = express.Router();
const { SubmitAiForm, getSubmittedForm } = require("../controllers/formController");
const { protect } = require("../middleware/auth"); // Import the auth middleware

// Protect both routes with authentication
router.post("/submit", protect, SubmitAiForm); // POST /api/form/submit
router.get("/:userId/:psychicId", protect, getSubmittedForm); // GET /api/form/:userId/:psychicId

module.exports = router;