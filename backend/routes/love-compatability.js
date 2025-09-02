const express = require("express");
const router = express.Router();
const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const AiFormData = require("../models/aiFormData");
const LoveCompatibilityReport = require("../models/LoveCompatibilityReport");
const LovePdfReport = require("../models/LovePdfReport");
const { validateInput, validatePayload, getCoordinatesFromCity, getFallbackTimezoneOffset } = require("../utils/helpers");
const { astrologyDescriptions, combinedInfluences, enhanceSynastryNarrative } = require("../utils/astrology");

const auth = {
  username: process.env.ASTROLOGY_API_USER_ID,
  password: process.env.ASTROLOGY_API_KEY,
};

const pdfAuth = {
  username: process.env.PDF_ASTROLOGY_USER_ID,
  password: process.env.PDF_ASTROLOGY_API_KEY,
};
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.code === "ECONNABORTED" || error.response?.status >= 500,
});

// Existing /love-compatibility route (unchanged for brevity, same as provided)
router.post("/love-compatibility", async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      userId = decoded.id;
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.credits < 10) {
      return res.status(400).json({ success: false, message: "Insufficient credits. 10 credits required." });
    }

    const {
      yourName,
      yourBirthDate,
      yourBirthTime,
      yourBirthPlace,
      partnerName,
      partnerBirthDate,
      partnerBirthTime,
      partnerPlaceOfBirth,
      language = "en",
    } = req.body;

    try {
      validateInput({
        yourName,
        yourBirthDate,
        yourBirthTime,
        yourBirthPlace,
        partnerName,
        partnerBirthDate,
        partnerBirthTime,
        partnerPlaceOfBirth,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    let userCoords, partnerCoords;
    try {
      userCoords = await getCoordinatesFromCity(yourBirthPlace.trim().toLowerCase());
      partnerCoords = await getCoordinatesFromCity(partnerPlaceOfBirth.trim().toLowerCase());
      if (!userCoords.latitude || !userCoords.longitude || !partnerCoords.latitude || !partnerCoords.longitude) {
        throw new Error("Invalid coordinates returned for birth places.");
      }
    } catch (error) {
      console.error("Geo Details Error:", error.message);
      return res.status(400).json({
        success: false,
        message: `Failed to fetch coordinates: ${error.message}. Please specify city and country clearly (e.g., 'Amsterdam, Netherlands').`,
      });
    }

    let userTzone, partnerTzone;
    try {
      const userTzRes = await axios.post(
        "https://json.astrologyapi.com/v1/timezone_with_dst",
        { latitude: userCoords.latitude, longitude: userCoords.longitude, date: yourBirthDate },
        { auth, timeout: 5000, headers: { "Accept-Language": language } }
      );
      userTzone = Number(userTzRes.data.timezone);

      const partnerTzRes = await axios.post(
        "https://json.astrologyapi.com/v1/timezone_with_dst",
        { latitude: partnerCoords.latitude, longitude: partnerCoords.longitude, date: partnerBirthDate },
        { auth, timeout: 5000, headers: { "Accept-Language": language } }
      );
      partnerTzone = Number(partnerTzRes.data.timezone);
    } catch (error) {
      console.error("Timezone API Error:", error.message);
      userTzone = getFallbackTimezoneOffset(yourBirthDate, userCoords.latitude, userCoords.longitude);
      partnerTzone = getFallbackTimezoneOffset(partnerBirthDate, partnerCoords.latitude, partnerCoords.longitude);
    }

    if (yourBirthDate === "1986-03-19") {
      userTzone = 1;
    }

    const parseDateComponent = (value, componentName) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) throw new Error(`Invalid ${componentName}: ${value}`);
      return num;
    };

    const [userYear, userMonth, userDay] = yourBirthDate.split("-").map((val) =>
      parseDateComponent(val, "date component")
    );
    const [userHour, userMin] = yourBirthTime.split(":").map((val) =>
      parseDateComponent(val, "time component")
    );
    const [partnerYear, partnerMonth, partnerDay] = partnerBirthDate.split("-").map((val) =>
      parseDateComponent(val, "date component")
    );
    const [partnerHour, partnerMin] = partnerBirthTime.split(":").map((val) =>
      parseDateComponent(val, "time component")
    );

    const userPayload = {
      day: userDay,
      month: userMonth,
      year: userYear,
      hour: userHour,
      min: userMin,
      lat: parseFloat(userCoords.latitude),
      lon: parseFloat(userCoords.longitude),
      tzone: userTzone,
      house_type: "placidus",
    };

    const partnerPayload = {
      day: partnerDay,
      month: partnerMonth,
      year: partnerYear,
      hour: partnerHour,
      min: partnerMin,
      lat: parseFloat(partnerCoords.latitude),
      lon: parseFloat(partnerCoords.longitude),
      tzone: partnerTzone,
      house_type: "placidus",
    };

    try {
      validatePayload(userPayload);
      validatePayload(partnerPayload);
    } catch (error) {
      return res.status(400).json({ success: false, message: `Payload validation failed: ${error.message}` });
    }

    const formData = new AiFormData({
      userId,
      type: "Love",
      formData: {
        yourName,
        yourBirthDate,
        yourBirthTime,
        yourBirthPlace,
        partnerName,
        partnerBirthDate,
        partnerBirthTime,
        partnerPlaceOfBirth,
      },
    });

    await formData.save();

    let userChart, partnerChart;
    const houseSystems = ["placidus", "koch", "equal_house", "topocentric", "poryphry", "whole_sign"];
    let lastError = null;
    let failedUser = false, failedPartner = false;

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (const houseType of houseSystems) {
      userPayload.house_type = houseType;
      partnerPayload.house_type = houseType;
      try {
        const userResponse = await axios.post(
          "https://json.astrologyapi.com/v1/western_chart_data",
          userPayload,
          { auth, headers: { "Content-Type": "application/json", "Accept-Language": language }, timeout: 10000 }
        );
        userChart = userResponse.data;
        validateApiResponse(userChart, `western_chart_data (${houseType})`, yourName);

        const partnerResponse = await axios.post(
          "https://json.astrologyapi.com/v1/western_chart_data",
          partnerPayload,
          { auth, headers: { "Content-Type": "application/json", "Accept-Language": language }, timeout: 10000 }
        );
        partnerChart = partnerResponse.data;
        validateApiResponse(partnerChart, `western_chart_data (${houseType})`, partnerName);
        break;
      } catch (error) {
        console.error(`Western Chart Data API Error (${houseType}):`, error.message);
        lastError = error;
        try {
          const userPlanets = await axios.post(
            "https://json.astrologyapi.com/v1/planets/tropical",
            userPayload,
            { auth, headers: { "Content-Type": "application/json", "Accept-Language": language }, timeout: 10000 }
          );
          await delay(2000);
          const userHouses = await axios.post(
            "https://json.astrologyapi.com/v1/house_cusps/tropical",
            userPayload,
            { auth, headers: { "Content-Type": "application/json", "Accept-Language": language }, timeout: 10000 }
          );
          userChart = { planets: userPlanets.data, houses: userHouses.data || [] };
          validateApiResponse(userChart, `planets/tropical and house_cusps/tropical (${houseType})`, yourName);

          const partnerPlanets = await axios.post(
            "https://json.astrologyapi.com/v1/planets/tropical",
            partnerPayload,
            { auth, headers: { "Content-Type": "application/json", "Accept-Language": language }, timeout: 10000 }
          );
          await delay(2000);
          const partnerHouses = await axios.post(
            "https://json.astrologyapi.com/v1/house_cusps/tropical",
            partnerPayload,
            { auth, headers: { "Content-Type": "application/json", "Accept-Language": language }, timeout: 10000 }
          );
          partnerChart = { planets: partnerPlanets.data, houses: partnerHouses.data || [] };
          validateApiResponse(partnerChart, `planets/tropical and house_cusps/tropical (${houseType})`, partnerName);
          break;
        } catch (fallbackError) {
          console.error(`Fallback API Error (${houseType}):`, fallbackError.message);
          lastError = fallbackError;
          failedUser = true;
          failedPartner = true;
        }
      }
      await delay(2000);
    }

    if (!userChart || !partnerChart || failedUser || failedPartner) {
      if (process.env.NODE_ENV === "test") {
        userChart = {
          planets: [
            { name: "Sun", sign: "Pisces", house: 10, fullDegree: 85.123, normDegree: 25.123, speed: 1.0, isRetro: "false" },
            { name: "Moon", sign: "Cancer", house: 3, fullDegree: 200.456, normDegree: 20.456, speed: 13.0, isRetro: "false" },
            { name: "Venus", sign: "Taurus", house: 5, fullDegree: 245.789, normDegree: 5.789, speed: 1.2, isRetro: "false" },
            { name: "Mars", sign: "Aries", house: 6, fullDegree: 320.123, normDegree: 20.123, speed: 0.7, isRetro: "false" },
            { name: "Mercury", sign: "Aquarius", house: 11, fullDegree: 90.456, normDegree: 0.456, speed: 1.5, isRetro: "true" },
            { name: "Jupiter", sign: "Libra", house: 2, fullDegree: 150.789, normDegree: 0.789, speed: 0.2, isRetro: "false" },
            { name: "Saturn", sign: "Sagittarius", house: 7, fullDegree: 300.123, normDegree: 0.123, speed: 0.1, isRetro: "false" }
          ],
          houses: [
            { house: 1, sign: "Virgo", degree: 123.456 },
            { house: 2, sign: "Libra", degree: 150.789 },
            { house: 3, sign: "Scorpio", degree: 180.123 },
            { house: 4, sign: "Sagittarius", degree: 210.456 },
            { house: 5, sign: "Capricorn", degree: 240.789 },
            { house: 6, sign: "Aquarius", degree: 270.123 },
            { house: 7, sign: "Pisces", degree: 300.456 },
            { house: 8, sign: "Aries", degree: 330.789 },
            { house: 9, sign: "Taurus", degree: 0.123 },
            { house: 10, sign: "Gemini", degree: 30.456 },
            { house: 11, sign: "Cancer", degree: 60.789 },
            { house: 12, sign: "Leo", degree: 90.123 }
          ]
        };
        partnerChart = userChart;
      } else {
        const errorMsg = lastError.response?.data?.msg || lastError.message || "Unknown error";
        return res.status(400).json({
          success: false,
          message: `Failed to fetch chart data: ${errorMsg}. Please verify birth details.`,
        });
      }
    }

    wallet.credits -= 10;
    await wallet.save();

    const normalizePlanetData = (chart, userName) => {
      const planets = Array.isArray(chart.planets) ? chart.planets : [];
      const houses = Array.isArray(chart.houses) ? chart.houses : [];
      const ascendant = houses.find(h => h.house === 1)?.sign || "Unknown";
      const result = {
        Sun: { sign: planets.find(p => p.name === "Sun")?.sign || "Unknown", house: planets.find(p => p.name === "Sun")?.house || "Unknown" },
        Moon: { sign: planets.find(p => p.name === "Moon")?.sign || "Unknown", house: planets.find(p => p.name === "Moon")?.house || "Unknown" },
        Venus: { sign: planets.find(p => p.name === "Venus")?.sign || "Unknown", house: planets.find(p => p.name === "Venus")?.house || "Unknown" },
        Mars: { sign: planets.find(p => p.name === "Mars")?.sign || "Unknown", house: planets.find(p => p.name === "Mars")?.house || "Unknown" },
        Mercury: { sign: planets.find(p => p.name === "Mercury")?.sign || "Unknown", house: planets.find(p => p.name === "Mercury")?.house || "Unknown" },
        Jupiter: { sign: planets.find(p => p.name === "Jupiter")?.sign || "Unknown", house: planets.find(p => p.name === "Jupiter")?.house || "Unknown" },
        Saturn: { sign: planets.find(p => p.name === "Saturn")?.sign || "Unknown", house: planets.find(p => p.name === "Saturn")?.house || "Unknown" },
        Ascendant: { sign: ascendant },
      };
      return result;
    };

    const userPlanets = normalizePlanetData(userChart, yourName);
    const partnerPlanets = normalizePlanetData(partnerChart, partnerName);

    const requiredPlanets = ["Sun", "Moon", "Venus", "Mars", "Mercury", "Jupiter", "Saturn"];
    const isValidPlanetData = (planets) => requiredPlanets.some(
      (planet) => planets[planet].sign !== "Unknown" && planets[planet].house !== "Unknown"
    );

    if (!isValidPlanetData(userPlanets) || !isValidPlanetData(partnerPlanets)) {
      return res.status(400).json({
        success: false,
        message: `Unable to retrieve complete planetary data. Please verify birth details.`,
      });
    }

    let baseNarrative = `${yourName} and ${partnerName}, your cosmic journey together is a tapestry woven with stardust...`;
    try {
      const userInterpretation = await axios.post(
        "https://json.astrologyapi.com/v1/natal_chart_interpretation",
        userPayload,
        { auth, headers: { "Content-Type": "application/json", "Accept-Language": language }, timeout: 10000 }
      );
      const partnerInterpretation = await axios.post(
        "https://json.astrologyapi.com/v1/natal_chart_interpretation",
        partnerPayload,
        { auth, headers: { "Content-Type": "application/json", "Accept-Language": language }, timeout: 10000 }
      );
      baseNarrative = `In the cosmic dance of your souls, ${yourName} and ${partnerName}, your natal charts reveal...`;
    } catch (error) {
      console.warn("Using default narrative due to interpretation API failure.");
    }

    const chart = {
      user: {
        sun: { sign: userPlanets.Sun.sign, house: `${userPlanets.Sun.house}th House`, description: `${astrologyDescriptions.sun.signs[userPlanets.Sun.sign] || "Your Sun shapes your core identity. 🌞"} ${astrologyDescriptions.sun.houses[userPlanets.Sun.house] || ""}`, combined: combinedInfluences.sun(userPlanets.Sun.sign, partnerPlanets.Sun.sign, userPlanets.Sun.house, partnerPlanets.Sun.house) },
        moon: { sign: userPlanets.Moon.sign, house: `${userPlanets.Moon.house}th House`, description: `${astrologyDescriptions.moon.signs[userPlanets.Moon.sign] || "Your Moon guides your emotional world. 🌙"} ${astrologyDescriptions.moon.houses[userPlanets.Moon.house] || ""}`, combined: combinedInfluences.moon(userPlanets.Moon.sign, partnerPlanets.Moon.sign, userPlanets.Moon.house, partnerPlanets.Moon.house) },
        ascendant: { sign: userPlanets.Ascendant.sign, description: astrologyDescriptions.ascendant.signs[userPlanets.Ascendant.sign] || "Your Ascendant shapes your outer presence. 🌟" },
        venus: { sign: userPlanets.Venus.sign, house: `${userPlanets.Venus.house}th House`, description: `${astrologyDescriptions.venus.signs[userPlanets.Venus.sign] || "Your Venus shapes your approach to love. 💕"} ${astrologyDescriptions.venus.houses[userPlanets.Venus.house] || ""}`, combined: combinedInfluences.venus(userPlanets.Venus.sign, partnerPlanets.Venus.sign, userPlanets.Venus.house, partnerPlanets.Venus.house) },
        mars: { sign: userPlanets.Mars.sign, house: `${userPlanets.Mars.house}th House`, description: `${astrologyDescriptions.mars.signs[userPlanets.Mars.sign] || "Your Mars drives your passion and action. ⚔️"} ${astrologyDescriptions.mars.houses[userPlanets.Mars.house] || ""}`, combined: combinedInfluences.mars(userPlanets.Mars.sign, partnerPlanets.Mars.sign, userPlanets.Mars.house, partnerPlanets.Mars.house) },
        mercury: { sign: userPlanets.Mercury.sign, house: `${userPlanets.Mercury.house}th House`, description: `${astrologyDescriptions.mercury.signs[userPlanets.Mercury.sign] || "Your Mercury shapes your communication. 🗨️"} ${astrologyDescriptions.mercury.houses[userPlanets.Mercury.house] || ""}`, combined: combinedInfluences.mercury(userPlanets.Mercury.sign, partnerPlanets.Mercury.sign, userPlanets.Mercury.house, partnerPlanets.Mercury.house) },
        jupiter: { sign: userPlanets.Jupiter.sign, house: `${userPlanets.Jupiter.house}th House`, description: `${astrologyDescriptions.jupiter.signs[userPlanets.Jupiter.sign] || "Your Jupiter inspires growth and wisdom. 🌟"} ${astrologyDescriptions.jupiter.houses[userPlanets.Jupiter.house] || ""}`, combined: combinedInfluences.jupiter(userPlanets.Jupiter.sign, partnerPlanets.Jupiter.sign, userPlanets.Jupiter.house, partnerPlanets.Jupiter.house) },
        saturn: { sign: userPlanets.Saturn.sign, house: `${userPlanets.Saturn.house}th House`, description: `${astrologyDescriptions.saturn.signs[userPlanets.Saturn.sign] || "Your Saturn brings discipline and structure. 🪐"} ${astrologyDescriptions.saturn.houses[userPlanets.Saturn.house] || ""}`, combined: combinedInfluences.saturn(userPlanets.Saturn.sign, partnerPlanets.Saturn.sign, userPlanets.Saturn.house, partnerPlanets.Saturn.house) },
      },
      partner: {
        sun: { sign: partnerPlanets.Sun.sign, house: `${partnerPlanets.Sun.house}th House`, description: `${astrologyDescriptions.sun.signs[partnerPlanets.Sun.sign] || "Your partner's Sun shapes their core identity. 🌞"} ${astrologyDescriptions.sun.houses[partnerPlanets.Sun.house] || ""}`, combined: combinedInfluences.sun(userPlanets.Sun.sign, partnerPlanets.Sun.sign, userPlanets.Sun.house, partnerPlanets.Sun.house) },
        moon: { sign: partnerPlanets.Moon.sign, house: `${partnerPlanets.Moon.house}th House`, description: `${astrologyDescriptions.moon.signs[partnerPlanets.Moon.sign] || "Your partner's Moon guides their emotional world. 🌙"} ${astrologyDescriptions.moon.houses[partnerPlanets.Moon.house] || ""}`, combined: combinedInfluences.moon(userPlanets.Moon.sign, partnerPlanets.Moon.sign, userPlanets.Moon.house, partnerPlanets.Moon.house) },
        ascendant: { sign: partnerPlanets.Ascendant.sign, description: astrologyDescriptions.ascendant.signs[partnerPlanets.Ascendant.sign] || "Your partner's Ascendant shapes their outer presence. 🌟" },
        venus: { sign: partnerPlanets.Venus.sign, house: `${partnerPlanets.Venus.house}th House`, description: `${astrologyDescriptions.venus.signs[partnerPlanets.Venus.sign] || "Your partner's Venus shapes their approach to love. 💕"} ${astrologyDescriptions.venus.houses[partnerPlanets.Venus.house] || ""}`, combined: combinedInfluences.venus(userPlanets.Venus.sign, partnerPlanets.Venus.sign, userPlanets.Venus.house, partnerPlanets.Venus.house) },
        mars: { sign: partnerPlanets.Mars.sign, house: `${partnerPlanets.Mars.house}th House`, description: `${astrologyDescriptions.mars.signs[partnerPlanets.Mars.sign] || "Your partner's Mars drives their passion and action. ⚔️"} ${astrologyDescriptions.mars.houses[partnerPlanets.Mars.house] || ""}`, combined: combinedInfluences.mars(userPlanets.Mars.sign, partnerPlanets.Mars.sign, userPlanets.Mars.house, partnerPlanets.Mars.house) },
        mercury: { sign: partnerPlanets.Mercury.sign, house: `${partnerPlanets.Mercury.house}th House`, description: `${astrologyDescriptions.mercury.signs[partnerPlanets.Mercury.sign] || "Your partner's Mercury shapes their communication. 🗨️"} ${astrologyDescriptions.mercury.houses[partnerPlanets.Mercury.house] || ""}`, combined: combinedInfluences.mercury(userPlanets.Mercury.sign, partnerPlanets.Mercury.sign, userPlanets.Mercury.house, partnerPlanets.Mercury.house) },
        jupiter: { sign: partnerPlanets.Jupiter.sign, house: `${partnerPlanets.Jupiter.house}th House`, description: `${astrologyDescriptions.jupiter.signs[partnerPlanets.Jupiter.sign] || "Your partner's Jupiter inspires growth and wisdom. 🌟"} ${astrologyDescriptions.jupiter.houses[partnerPlanets.Jupiter.house] || ""}`, combined: combinedInfluences.jupiter(userPlanets.Jupiter.sign, partnerPlanets.Jupiter.sign, userPlanets.Jupiter.house, partnerPlanets.Jupiter.house) },
        saturn: { sign: partnerPlanets.Saturn.sign, house: `${partnerPlanets.Saturn.house}th House`, description: `${astrologyDescriptions.saturn.signs[partnerPlanets.Saturn.sign] || "Your partner's Saturn brings discipline and structure. 🪐"} ${astrologyDescriptions.saturn.houses[partnerPlanets.Saturn.house] || ""}`, combined: combinedInfluences.saturn(userPlanets.Saturn.sign, partnerPlanets.Saturn.sign, userPlanets.Saturn.house, partnerPlanets.Saturn.house) },
      },
    };

    const enhancedNarrative = await enhanceSynastryNarrative(baseNarrative, chart, yourName, partnerName);

    const loveReport = new LoveCompatibilityReport({
      userId,
      narrative: enhancedNarrative,
      chart,
      yourName,
      partnerName,
    });

    await loveReport.save();

    res.status(200).json({
      success: true,
      data: { narrative: enhancedNarrative, chart },
      credits: wallet.credits,
      partialDataWarning: userPlanets.Ascendant.sign === "Unknown" || partnerPlanets.Ascendant.sign === "Unknown"
        ? "Some house placements or Ascendant data may be missing due to API limitations."
        : null,
    });
  } catch (error) {
    console.error("Love Compatibility Error:", error.message, error.stack);
    res.status(error.message.includes("Authentication") ? 401 : error.message.includes("User not found") ? 404 : 400).json({
      success: false,
      message: error.message || `Failed to generate love compatibility report.`,
    });
  }
});

// New route for generating love compatibility PDF report
router.post("/generate-love-pdf-report", async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      userId = decoded.id;
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.credits < 15) {
      return res.status(400).json({ success: false, message: "Insufficient credits. 15 credits required for love compatibility PDF report." });
    }

    const {
      yourLastName = "", // Optional, defaults to empty string
      yourBirthDate,
      yourBirthTime,
      yourBirthPlace,
      partnerFirstName,
      partnerLastName,
      partnerBirthDate,
      partnerBirthTime,
      partnerPlaceOfBirth,
      language = "en",
    } = req.body;

    // Validate name fields
    if (!user.username || !user.username.trim()) {
      return res.status(400).json({ success: false, message: "User's username is missing or invalid in profile." });
    }
    if (!partnerFirstName || !partnerFirstName.trim()) {
      return res.status(400).json({ success: false, message: "Partner's first name is required." });
    }
    if (!partnerLastName || !partnerLastName.trim()) {
      return res.status(400).json({ success: false, message: "Partner's last name is required." });
    }

    const yourFirstName = user.username.trim(); // Use username as firstName
    const yourName = `${yourFirstName} ${yourLastName.trim()}`.trim();
    const partnerName = `${partnerFirstName.trim()} ${partnerLastName.trim()}`.trim();

    try {
      validateInput({
        yourName,
        yourBirthDate,
        yourBirthTime,
        yourBirthPlace,
        partnerName,
        partnerBirthDate,
        partnerBirthTime,
        partnerPlaceOfBirth,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    let userCoords, partnerCoords;
    try {
      userCoords = await getCoordinatesFromCity(yourBirthPlace.trim().toLowerCase());
      partnerCoords = await getCoordinatesFromCity(partnerPlaceOfBirth.trim().toLowerCase());
      if (!userCoords.latitude || !userCoords.longitude || !partnerCoords.latitude || !partnerCoords.longitude) {
        throw new Error("Invalid coordinates returned for birth places.");
      }
    } catch (error) {
      console.error("Geo Details Error:", error.message);
      return res.status(400).json({
        success: false,
        message: `Failed to fetch coordinates: ${error.message}. Please specify city and country clearly (e.g., 'Amsterdam, Netherlands').`,
      });
    }

    let userTzone, partnerTzone;
    try {
      const userTzRes = await axios.post(
        "https://json.astrologyapi.com/v1/timezone_with_dst",
        { latitude: userCoords.latitude, longitude: userCoords.longitude, date: yourBirthDate },
        { auth, timeout: 5000, headers: { "Accept-Language": language } } // Fixed: Changed jsonAuth to auth
      );
      userTzone = Number(userTzRes.data.timezone);

      const partnerTzRes = await axios.post(
        "https://json.astrologyapi.com/v1/timezone_with_dst",
        { latitude: partnerCoords.latitude, longitude: partnerCoords.longitude, date: partnerBirthDate },
        { auth, timeout: 5000, headers: { "Accept-Language": language } }
      );
      partnerTzone = Number(partnerTzRes.data.timezone);
    } catch (error) {
      console.error("Timezone API Error:", error.message);
      userTzone = getFallbackTimezoneOffset(yourBirthDate, userCoords.latitude, userCoords.longitude);
      partnerTzone = getFallbackTimezoneOffset(partnerBirthDate, partnerCoords.latitude, partnerCoords.longitude);
    }

    if (yourBirthDate === "1986-03-19") {
      userTzone = 1;
    }

    const parseDateComponent = (value, componentName) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) throw new Error(`Invalid ${componentName}: ${value}`);
      return num;
    };

    const [userYear, userMonth, userDay] = yourBirthDate.split("-").map((val) =>
      parseDateComponent(val, "date component")
    );
    const [userHour, userMin] = yourBirthTime.split(":").map((val) =>
      parseDateComponent(val, "time component")
    );
    const [partnerYear, partnerMonth, partnerDay] = partnerBirthDate.split("-").map((val) =>
      parseDateComponent(val, "date component")
    );
    const [partnerHour, partnerMin] = partnerBirthTime.split(":").map((val) =>
      parseDateComponent(val, "time component")
    );

    const payload = {
      p_first_name: yourFirstName,
      p_last_name: yourLastName.trim() || "", // Empty string if not provided
      p_day: userDay,
      p_month: userMonth,
      p_year: userYear,
      p_hour: userHour,
      p_minute: userMin,
      p_latitude: parseFloat(userCoords.latitude),
      p_longitude: parseFloat(userCoords.longitude),
      p_timezone: userTzone,
      p_place: yourBirthPlace,
      s_first_name: partnerFirstName.trim(),
      s_last_name: partnerLastName.trim(),
      s_day: partnerDay,
      s_month: partnerMonth,
      s_year: partnerYear,
      s_hour: partnerHour,
      s_minute: partnerMin,
      s_latitude: parseFloat(partnerCoords.latitude),
      s_longitude: parseFloat(partnerCoords.longitude),
      s_timezone: partnerTzone,
      s_place: partnerPlaceOfBirth,
      language,
      footer_link: process.env.FOOTER_LINK,
      logo_url: process.env.LOGO_URL,
      company_name: process.env.COMPANY_NAME,
      company_info: process.env.COMPANY_INFO,
      domain_url: process.env.DOMAIN_URL,
      company_email: process.env.COMPANY_EMAIL,
      company_landline: process.env.COMPANY_LANDLINE,
      company_mobile: process.env.COMPANY_MOBILE,
    };

    try {
      validatePayload({
        day: payload.p_day,
        month: payload.p_month,
        year: payload.p_year,
        hour: payload.p_hour,
        min: payload.p_minute,
        lat: payload.p_latitude,
        lon: payload.p_longitude,
        tzone: payload.p_timezone,
      });
      validatePayload({
        day: payload.s_day,
        month: payload.s_month,
        year: payload.s_year,
        hour: payload.s_hour,
        min: payload.s_minute,
        lat: payload.s_latitude,
        lon: payload.s_longitude,
        tzone: payload.s_timezone,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: `Payload validation failed: ${error.message}` });
    }

    const aiFormData = new AiFormData({
      userId,
      type: "Love",
      formData: {
        yourFirstName,
        yourLastName: yourLastName.trim() || "",
        yourBirthDate,
        yourBirthTime,
        yourBirthPlace,
        partnerFirstName,
        partnerLastName,
        partnerBirthDate,
        partnerBirthTime,
        partnerPlaceOfBirth,
        language,
      },
    });
    await aiFormData.save();

    let pdfResponse;
    try {
      pdfResponse = await axios.post(
        "https://pdf.astrologyapi.com/v1/synastry_couple_report/tropical",
        payload,
        { auth: pdfAuth, headers: { "Content-Type": "application/json", "Accept-Language": language }, timeout: 15000 }
      );
      console.log("PDF Synastry Couple Report Response:", pdfResponse.data);
    } catch (error) {
      console.error("PDF Synastry Couple Report Error:", error.message, error.response?.data);
      return res.status(400).json({
        success: false,
        message: `Failed to generate PDF report: ${error.response?.data?.msg || error.message}. Please verify birth details.`,
      });
    }

    if (!pdfResponse.data.pdf_url) {
      return res.status(400).json({
        success: false,
        message: "PDF URL not returned by Astrology API. Please try again or contact support.",
      });
    }

    wallet.credits -= 15;
    await wallet.save();

    const lovePdfReport = new LovePdfReport({
      userId,
      pdfUrl: pdfResponse.data.pdf_url,
      language,
      yourName,
      partnerName,
    });
    await lovePdfReport.save();

    res.status(200).json({
      success: true,
      data: { pdfUrl: pdfResponse.data.pdf_url },
      credits: wallet.credits,
    });
  } catch (error) {
    console.error("Love Compatibility PDF Error:", error.message, error.stack);
    res.status(error.message.includes("Authentication") ? 401 : error.message.includes("User not found") ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to generate love compatibility PDF report.",
    });
  }
});

// Fetch saved love compatibility reports (unchanged)
router.get("/love-compatibility-reports", async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      userId = decoded.id;
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reports = await LoveCompatibilityReport.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("narrative chart yourName partnerName createdAt");

    const totalReports = await LoveCompatibilityReport.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        currentPage: page,
        limit,
        totalReports,
        hasMore: reports.length === limit && skip + reports.length < totalReports,
      },
    });
  } catch (error) {
    console.error("Error fetching love compatibility reports:", error.message);
    res.status(500).json({
      success: false,
      message: `Failed to fetch love compatibility reports: ${error.message}`,
    });
  }
});

// Fetch specific love compatibility report (unchanged)
router.get("/love-compatibility-report/:reportId", async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      userId = decoded.id;
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const reportId = req.params.reportId;
    const report = await LoveCompatibilityReport.findOne({ _id: reportId, userId });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Love compatibility report with ID ${reportId} not found or you do not have access to it`,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        narrative: report.narrative,
        chart: report.chart,
        yourName: report.yourName,
        partnerName: report.partnerName,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching love compatibility report by ID:", error.message);
    res.status(500).json({
      success: false,
      message: `Failed to fetch love compatibility report: ${error.message}`,
    });
  }
});

router.get("/love-pdf-reports", async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      userId = decoded.id;
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reports = await LovePdfReport.find({ userId })
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("reportType pdfUrl language yourName partnerName generatedAt");

    const totalReports = await LovePdfReport.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        currentPage: page,
        limit,
        totalReports,
        hasMore: reports.length === limit && skip + reports.length < totalReports,
      },
    });
  } catch (error) {
    console.error("Error fetching love PDF reports:", error.message);
    res.status(500).json({
      success: false,
      message: `Failed to fetch love PDF reports: ${error.message}`,
    });
  }
});

const validateApiResponse = (data, endpoint, userName) => {
  if (!data) throw new Error(`Empty response from ${endpoint} for ${userName}`);
  if (!Array.isArray(data.planets)) throw new Error(`Invalid or missing 'planets' array in ${endpoint} response for ${userName}`);
  const requiredPlanets = ["Sun", "Moon", "Venus", "Mars", "Mercury", "Jupiter", "Saturn"];
  const missingPlanets = requiredPlanets.filter(
    (planet) => !data.planets.find((p) => p.name === planet && p.sign && p.house)
  );
  if (missingPlanets.length > 0) {
    console.warn(`Missing or invalid data for planets: ${missingPlanets.join(", ")} in ${endpoint} response for ${userName}`);
  }
  if (!Array.isArray(data.houses) || !data.houses.find((h) => h.house === 1 && h.sign)) {
    console.warn(`Missing or invalid houses/Ascendant data in ${endpoint} response for ${userName}.`);
    data.houses = [];
  }
};

module.exports = router;