// routes/geocode.js
const express = require("express");
const router = express.Router();
const { getCoordinatesFromCity } = require("../utils/geocode");

router.get("/", async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    const coords = await getCoordinatesFromCity(city);
    return res.status(200).json(coords);
  } catch (error) {
    console.error("🔥 Backend Geocode Error:", error);
    return res.status(500).json({ error: error.message || "Failed to get coordinates" });
  }
});


module.exports = router;
