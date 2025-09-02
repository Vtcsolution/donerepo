const express = require("express");
const router = express.Router();
const { getNumerologyReport } = require("../controllers/numerologyController");
const { protect } = require("../middleware/auth");

router.get("/numerology-report", protect, getNumerologyReport);

module.exports = router;