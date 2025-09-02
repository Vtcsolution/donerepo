const express = require("express");
const router = express.Router();
const { sendMessage } = require("../controllers/messageController");

// Public route for sending a message
router.post("/contact", sendMessage);

module.exports = router;
