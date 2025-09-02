// utils/geocode.js
const axios = require("axios");

const getCoordinatesFromCity = async (cityName) => {
  try {
    if (!cityName || typeof cityName !== "string" || cityName.trim() === "") {
      throw new Error("City name is empty.");
    }

    const cleanCity = cityName.trim();

    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: cleanCity,
        format: "json",
        limit: 1,
      },
      headers: {
        'User-Agent': 'MyPsychicApp/1.0 (admin@myapp.com)'
      }
    });

    if (!response.data || response.data.length === 0) {
      throw new Error(`No location found for city "${cleanCity}"`);
    }

    const { lat, lon } = response.data[0];
    return { latitude: lat, longitude: lon };
  } catch (error) {
    console.error("🌍 Geocoding Error:", error.message);
    throw new Error("Failed to fetch coordinates from city name");
  }
};

module.exports = { getCoordinatesFromCity };
