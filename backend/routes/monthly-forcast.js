const express = require("express");
const router = express.Router();
const { generateMonthlyForecast, getMonthlyForecasts, getMonthlyForecastById } = require("../controllers/monthlyForecastController");
const { protect } = require("../middleware/auth");

router.post("/monthly-forecast", protect, generateMonthlyForecast);
router.get("/monthly-forecasts", protect, getMonthlyForecasts);
router.get("/monthly-forecast/:reportId", protect, getMonthlyForecastById);

module.exports = router;