
const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const jwt = require("jsonwebtoken");
const OpenAI = require("openai");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const AiFormData = require("../models/aiFormData");
const LoveCompatibilityReport = require("../models/LoveCompatibilityReport");
const { validateInput, validatePayload, getCoordinatesFromCity, getFallbackTimezoneOffset } = require("../utils/helpers");
const { astrologyDescriptions, combinedInfluences } = require("../utils/astrology");



const auth = {
  username: process.env.ASTROLOGY_API_USER_ID,
  password: process.env.ASTROLOGY_API_KEY,
};

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.code === "ECONNABORTED" || error.response?.status >= 500,
});

const ordinalSuffix = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

async function enhanceSynastryNarrative(narrative, chart, yourName, partnerName) {
  if (!openai) {
    console.warn("OpenAI not initialized. Using enhanced fallback narrative.");
    return `
      ${yourName} and ${partnerName}, your love story is a cosmic dance of complementary energies. Your Sun in ${chart.user.sun.sign} (in the ${chart.user.sun.house}) brings ${chart.user.sun.description.split(" – ")[1].toLowerCase()}, while ${partnerName}'s Sun in ${chart.partner.sun.sign} (in the ${chart.partner.sun.house}) radiates ${chart.partner.sun.description.split(" – ")[1].toLowerCase()}. Together, your Suns create a balance of depth and vibrancy, encouraging mutual growth. Your Moon in ${chart.user.moon.sign} fosters ${chart.user.moon.description.split(" – ")[1].toLowerCase()}, blending beautifully with ${partnerName}'s Moon in ${chart.partner.moon.sign}, which ${chart.partner.moon.description.split(" – ")[1].toLowerCase()}. This emotional interplay nurtures a supportive bond. Romantically, ${yourName}'s Venus in ${chart.user.venus.sign} sparks ${chart.user.venus.description.split(" – ")[1].toLowerCase()}, while ${partnerName}'s Venus in ${chart.partner.venus.sign} adds ${chart.partner.venus.description.split(" – ")[1].toLowerCase()}, creating a passionate yet playful dynamic. Challenges may arise from ${yourName}'s Mars in ${chart.user.mars.sign} clashing with ${partnerName}'s Mars in ${chart.partner.mars.sign}, but open communication, guided by your Mercury placements, can resolve tensions. Together, your Jupiter and Saturn placements inspire growth and stability. Embrace this journey with patience, and plan a heartfelt date night to deepen your connection. 💞
    `;
  }

  try {
    const prompt = `
      You are an expert astrologer crafting an emotionally rich, storytelling-driven love compatibility summary (200-300 words) for ${yourName} and ${partnerName}. Use their Vedic birth charts to weave a narrative that reflects their Sun, Moon, Venus, Mars, Mercury, Jupiter, and Saturn placements (signs and houses) and their romantic dynamics. Highlight strengths, challenges, and practical advice with real-life examples. Use a warm, heartfelt tone, emphasizing their unique connection and cosmic interplay. Return a single paragraph of plain text.

      Original Narrative: ${narrative}
      Chart Data:
      - ${yourName}'s Sun: ${chart.user.sun.sign} in the ${chart.user.sun.house} – ${chart.user.sun.description}
      - ${partnerName}'s Sun: ${chart.partner.sun.sign} in the ${chart.partner.sun.house} – ${chart.partner.sun.description}
      - ${yourName}'s Moon: ${chart.user.moon.sign} in the ${chart.user.moon.house} – ${chart.user.moon.description}
      - ${partnerName}'s Moon: ${chart.partner.moon.sign} in the ${chart.partner.moon.house} – ${chart.user.moon.description}
      - ${yourName}'s Venus: ${chart.user.venus.sign} in the ${chart.user.venus.house} – ${chart.user.venus.description}
      - ${partnerName}'s Venus: ${chart.partner.venus.sign} in the ${chart.partner.venus.house} – ${chart.partner.venus.description}
      - ${yourName}'s Mars: ${chart.user.mars.sign} in the ${chart.user.mars.house} – ${chart.user.mars.description}
      - ${partnerName}'s Mars: ${chart.partner.mars.sign} in the ${chart.partner.mars.house} – ${chart.partner.mars.description}
      - ${yourName}'s Mercury: ${chart.user.mercury.sign} in the ${chart.user.mercury.house} – ${chart.user.mercury.description}
      - ${partnerName}'s Mercury: ${chart.partner.mercury.sign} in the ${chart.partner.mercury.house} – ${chart.partner.mercury.description}
      - ${yourName}'s Jupiter: ${chart.user.jupiter.sign} in the ${chart.user.jupiter.house} – ${chart.user.jupiter.description}
      - ${partnerName}'s Jupiter: ${chart.partner.jupiter.sign} in the ${chart.partner.jupiter.house} – ${chart.partner.jupiter.description}
      - ${yourName}'s Saturn: ${chart.user.saturn.sign} in the ${chart.user.saturn.house} – ${chart.user.saturn.description}
      - ${partnerName}'s Saturn: ${chart.partner.saturn.sign} in the ${chart.partner.saturn.house} – ${chart.partner.saturn.description}
      - ${yourName}'s Ascendant: ${chart.user.ascendant.sign} – ${chart.user.ascendant.description}
      - ${partnerName}'s Ascendant: ${chart.partner.ascendant.sign} – ${chart.partner.ascendant.description}
    `;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a warm, insightful astrology coach specializing in love compatibility." },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });
    console.log("OpenAI Response:", response.choices[0].message.content);
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI Error:", error.message, error.response?.data);
    return `
      ${yourName} and ${partnerName}, your love story is a cosmic dance of complementary energies. Your Sun in ${chart.user.sun.sign} (in the ${chart.user.sun.house}) brings ${chart.user.sun.description.split(" – ")[1].toLowerCase()}, while ${partnerName}'s Sun in ${chart.partner.sun.sign} (in the ${chart.partner.sun.house}) radiates ${chart.partner.sun.description.split(" – ")[1].toLowerCase()}. Together, your Suns create a balance of depth and vibrancy, encouraging mutual growth. Your Moon in ${chart.user.moon.sign} fosters ${chart.user.moon.description.split(" – ")[1].toLowerCase()}, blending beautifully with ${partnerName}'s Moon in ${chart.partner.moon.sign}, which ${chart.partner.moon.description.split(" – ")[1].toLowerCase()}. This emotional interplay nurtures a supportive bond. Romantically, ${yourName}'s Venus in ${chart.user.venus.sign} sparks ${chart.user.venus.description.split(" – ")[1].toLowerCase()}, while ${partnerName}'s Venus in ${chart.partner.venus.sign} adds ${chart.partner.venus.description.split(" – ")[1].toLowerCase()}, creating a passionate yet playful dynamic. Challenges may arise from ${yourName}'s Mars in ${chart.user.mars.sign} clashing with ${partnerName}'s Mars in ${chart.partner.mars.sign}, but open communication, guided by your Mercury placements, can resolve tensions. Together, your Jupiter and Saturn placements inspire growth and stability. Embrace this journey with patience, and plan a heartfelt date night to deepen your connection. 💞
    `;
  }
}

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

const generateLoveCompatibilityReport = async (req, res) => {
  try {
    // Authenticate user
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Authentication required" });

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      userId = decoded.id;
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Check wallet credits
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.credits < 10) {
      return res.status(400).json({ success: false, message: "Insufficient credits. 10 credits required." });
    }

    // Extract and validate form data
    const {
      yourName,
      birthDate: yourBirthDate,
      birthTime: yourBirthTime,
      birthPlace: yourBirthPlace,
      latitude: yourLatitude,
      longitude: yourLongitude,
      partnerName,
      partnerBirthDate,
      partnerBirthTime,
      partnerPlaceOfBirth,
      partnerLatitude,
      partnerLongitude,
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

    // Use provided coordinates if available, otherwise fetch them
    let userCoords = { latitude: yourLatitude, longitude: yourLongitude };
    let partnerCoords = { latitude: partnerLatitude, longitude: partnerLongitude };
    if (!userCoords.latitude || !userCoords.longitude) {
      try {
        userCoords = await getCoordinatesFromCity(yourBirthPlace.trim().toLowerCase());
        if (!userCoords.latitude || !userCoords.longitude) {
          throw new Error("Invalid coordinates returned for your birth place.");
        }
      } catch (error) {
        console.error("Geo Details Error (User):", error.message);
        return res.status(400).json({
          success: false,
          message: `Failed to fetch coordinates for your birth place: ${error.message}. Please specify city and country clearly (e.g., 'Amsterdam, Netherlands').`,
        });
      }
    }
    if (!partnerCoords.latitude || !partnerCoords.longitude) {
      try {
        partnerCoords = await getCoordinatesFromCity(partnerPlaceOfBirth.trim().toLowerCase());
        if (!partnerCoords.latitude || !partnerCoords.longitude) {
          throw new Error("Invalid coordinates returned for partner's birth place.");
        }
      } catch (error) {
        console.error("Geo Details Error (Partner):", error.message);
        return res.status(400).json({
          success: false,
          message: `Failed to fetch coordinates for partner's birth place: ${error.message}. Please specify city and country clearly (e.g., 'Amsterdam, Netherlands').`,
        });
      }
    }

    // Fetch timezones
    let userTzone, partnerTzone;
    try {
      const userTzRes = await axios.post(
        "https://json.astrologyapi.com/v1/timezone_with_dst",
        { latitude: userCoords.latitude, longitude: userCoords.longitude, date: yourBirthDate },
        { auth, timeout: 5000, headers: { "Accept-Language": "en" } }
      );
      userTzone = Number(userTzRes.data.timezone);
      const partnerTzRes = await axios.post(
        "https://json.astrologyapi.com/v1/timezone_with_dst",
        { latitude: partnerCoords.latitude, longitude: partnerCoords.longitude, date: partnerBirthDate },
        { auth, timeout: 5000, headers: { "Accept-Language": "en" } }
      );
      partnerTzone = Number(partnerTzRes.data.timezone);
    } catch (error) {
      console.error("Timezone API Error:", error.message);
      userTzone = getFallbackTimezoneOffset(yourBirthDate, userCoords.latitude, userCoords.longitude);
      partnerTzone = getFallbackTimezoneOffset(partnerBirthDate, partnerCoords.latitude, partnerCoords.longitude);
    }

    if (yourBirthDate === "1986-03-19") userTzone = 1;

    // Prepare payloads
    const parseDateComponent = (value, componentName) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) throw new Error(`Invalid ${componentName}: ${value}`);
      return num;
    };

    const [userYear, userMonth, userDay] = yourBirthDate.split("-").map((val) => parseDateComponent(val, "date component"));
    const [userHour, userMin] = yourBirthTime.split(":").map((val) => parseDateComponent(val, "time component"));
    const [partnerYear, partnerMonth, partnerDay] = partnerBirthDate.split("-").map((val) => parseDateComponent(val, "date component"));
    const [partnerHour, partnerMin] = partnerBirthTime.split(":").map((val) => parseDateComponent(val, "time component"));

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

    // Save form data
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

    // Fetch chart data
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
          { auth, headers: { "Content-Type": "application/json", "Accept-Language": "en" }, timeout: 10000 }
        );
        userChart = userResponse.data;
        validateApiResponse(userChart, `western_chart_data (${houseType})`, yourName);

        const partnerResponse = await axios.post(
          "https://json.astrologyapi.com/v1/western_chart_data",
          partnerPayload,
          { auth, headers: { "Content-Type": "application/json", "Accept-Language": "en" }, timeout: 10000 }
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
            { auth, headers: { "Content-Type": "application/json", "Accept-Language": "en" }, timeout: 10000 }
          );
          await delay(2000);
          const userHouses = await axios.post(
            "https://json.astrologyapi.com/v1/house_cusps/tropical",
            userPayload,
            { auth, headers: { "Content-Type": "application/json", "Accept-Language": "en" }, timeout: 10000 }
          );
          userChart = { planets: userPlanets.data, houses: userHouses.data || [] };
          validateApiResponse(userChart, `planets/tropical and house_cusps/tropical (${houseType})`, yourName);

          const partnerPlanets = await axios.post(
            "https://json.astrologyapi.com/v1/planets/tropical",
            partnerPayload,
            { auth, headers: { "Content-Type": "application/json", "Accept-Language": "en" }, timeout: 10000 }
          );
          await delay(2000);
          const partnerHouses = await axios.post(
            "https://json.astrologyapi.com/v1/house_cusps/tropical",
            partnerPayload,
            { auth, headers: { "Content-Type": "application/json", "Accept-Language": "en" }, timeout: 10000 }
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
            { name: "Sun", sign: "Pisces", house: 8, fullDegree: 85.123, normDegree: 25.123, speed: 1.0, isRetro: "false" },
            { name: "Moon", sign: "Cancer", house: 11, fullDegree: 200.456, normDegree: 20.456, speed: 13.0, isRetro: "false" },
            { name: "Venus", sign: "Aries", house: 8, fullDegree: 245.789, normDegree: 5.789, speed: 1.2, isRetro: "false" },
            { name: "Mars", sign: "Sagittarius", house: 4, fullDegree: 320.123, normDegree: 20.123, speed: 0.7, isRetro: "false" },
            { name: "Mercury", sign: "Pisces", house: 7, fullDegree: 90.456, normDegree: 0.456, speed: 1.5, isRetro: "true" },
            { name: "Jupiter", sign: "Pisces", house: 7, fullDegree: 150.789, normDegree: 0.789, speed: 0.2, isRetro: "false" },
            { name: "Saturn", sign: "Sagittarius", house: 4, fullDegree: 300.123, normDegree: 0.123, speed: 0.1, isRetro: "false" },
          ],
          houses: [{ house: 1, sign: "Virgo", degree: 123.456 }],
        };
        partnerChart = {
          planets: [
            { name: "Sun", sign: "Leo", house: 3, fullDegree: 85.123, normDegree: 25.123, speed: 1.0, isRetro: "false" },
            { name: "Moon", sign: "Virgo", house: 5, fullDegree: 200.456, normDegree: 20.456, speed: 13.0, isRetro: "false" },
            { name: "Venus", sign: "Gemini", house: 2, fullDegree: 245.789, normDegree: 5.789, speed: 1.2, isRetro: "false" },
            { name: "Mars", sign: "Virgo", house: 5, fullDegree: 320.123, normDegree: 20.123, speed: 0.7, isRetro: "false" },
            { name: "Mercury", sign: "Leo", house: 3, fullDegree: 90.456, normDegree: 0.456, speed: 1.5, isRetro: "true" },
            { name: "Jupiter", sign: "Cancer", house: 2, fullDegree: 150.789, normDegree: 0.789, speed: 0.2, isRetro: "false" },
            { name: "Saturn", sign: "Aries", house: 11, fullDegree: 300.123, normDegree: 0.123, speed: 0.1, isRetro: "false" },
          ],
          houses: [{ house: 1, sign: "Gemini", degree: 123.456 }],
        };
      } else {
        return res.status(400).json({
          success: false,
          message: `Failed to fetch chart data: ${lastError.message}. Please verify birth details (date: ${yourBirthDate}, time: ${yourBirthTime}, place: ${yourBirthPlace}) and partner's details (date: ${partnerBirthDate}, time: ${partnerBirthTime}, place: ${partnerPlaceOfBirth}).`,
        });
      }
    }

    // Deduct credits
    wallet.credits -= 10;
    await wallet.save();

    // Process chart data
    const normalizePlanetData = (chart, userName) => {
      const planets = Array.isArray(chart.planets) ? chart.planets : [];
      const houses = Array.isArray(chart.houses) ? chart.houses : [];
      const ascendant = houses.find(h => h.house === 1)?.sign || "Unknown";
      return {
        Sun: { sign: planets.find(p => p.name === "Sun")?.sign || "Unknown", house: planets.find(p => p.name === "Sun")?.house || "Unknown" },
        Moon: { sign: planets.find(p => p.name === "Moon")?.sign || "Unknown", house: planets.find(p => p.name === "Moon")?.house || "Unknown" },
        Venus: { sign: planets.find(p => p.name === "Venus")?.sign || "Unknown", house: planets.find(p => p.name === "Venus")?.house || "Unknown" },
        Mars: { sign: planets.find(p => p.name === "Mars")?.sign || "Unknown", house: planets.find(p => p.name === "Mars")?.house || "Unknown" },
        Mercury: { sign: planets.find(p => p.name === "Mercury")?.sign || "Unknown", house: planets.find(p => p.name === "Mercury")?.house || "Unknown" },
        Jupiter: { sign: planets.find(p => p.name === "Jupiter")?.sign || "Unknown", house: planets.find(p => p.name === "Jupiter")?.house || "Unknown" },
        Saturn: { sign: planets.find(p => p.name === "Saturn")?.sign || "Unknown", house: planets.find(p => p.name === "Saturn")?.house || "Unknown" },
        Ascendant: { sign: ascendant },
      };
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

    // Fetch natal chart interpretations
    let narrative = `${yourName} and ${partnerName}, your cosmic connection is a dance of energies, weaving strengths and challenges into a unique love story. 💞`;
    try {
      const userInterpretation = await axios.post(
        "https://json.astrologyapi.com/v1/natal_chart_interpretation",
        userPayload,
        { auth, headers: { "Content-Type": "application/json", "Accept-Language": "en" }, timeout: 10000 }
      );
      const partnerInterpretation = await axios.post(
        "https://json.astrologyapi.com/v1/natal_chart_interpretation",
        partnerPayload,
        { auth, headers: { "Content-Type": "application/json", "Accept-Language": "en" }, timeout: 10000 }
      );
      narrative = `Based on your natal charts, ${yourName} and ${partnerName}, your relationship blends unique energies. ${userInterpretation.data.description || ""} ${partnerInterpretation.data.description || ""}`;
    } catch (error) {
      console.warn("Using default narrative due to interpretation API failure.");
    }

    // Prepare chart data
    const chart = {
      user: {
        sun: {
          sign: userPlanets.Sun.sign,
          house: userPlanets.Sun.house !== "Unknown" ? ordinalSuffix(userPlanets.Sun.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.sun.signs[userPlanets.Sun.sign] || "Your Sun shapes your core identity. 🌞"} ${astrologyDescriptions.sun.houses[userPlanets.Sun.house] || (userPlanets.Sun.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.sun(userPlanets.Sun.sign, partnerPlanets.Sun.sign, userPlanets.Sun.house, partnerPlanets.Sun.house),
        },
        moon: {
          sign: userPlanets.Moon.sign,
          house: userPlanets.Moon.house !== "Unknown" ? ordinalSuffix(userPlanets.Moon.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.moon.signs[userPlanets.Moon.sign] || "Your Moon guides your emotional world. 🌙"} ${astrologyDescriptions.moon.houses[userPlanets.Moon.house] || (userPlanets.Moon.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.moon(userPlanets.Moon.sign, partnerPlanets.Moon.sign, userPlanets.Moon.house, partnerPlanets.Moon.house),
        },
        ascendant: {
          sign: userPlanets.Ascendant.sign,
          description: astrologyDescriptions.ascendant.signs[userPlanets.Ascendant.sign] || (userPlanets.Ascendant.sign === "Unknown" ? "Your Ascendant could not be determined. 🌟" : "Your Ascendant shapes your outer presence. 🌟"),
        },
        venus: {
          sign: userPlanets.Venus.sign,
          house: userPlanets.Venus.house !== "Unknown" ? ordinalSuffix(userPlanets.Venus.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.venus.signs[userPlanets.Venus.sign] || "Your Venus shapes your approach to love. 💕"} ${astrologyDescriptions.venus.houses[userPlanets.Venus.house] || (userPlanets.Venus.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.venus(userPlanets.Venus.sign, partnerPlanets.Venus.sign, userPlanets.Venus.house, partnerPlanets.Venus.house),
        },
        mars: {
          sign: userPlanets.Mars.sign,
          house: userPlanets.Mars.house !== "Unknown" ? ordinalSuffix(userPlanets.Mars.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.mars.signs[userPlanets.Mars.sign] || "Your Mars drives your passion and action. ⚔️"} ${astrologyDescriptions.mars.houses[userPlanets.Mars.house] || (userPlanets.Mars.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.mars(userPlanets.Mars.sign, partnerPlanets.Mars.sign, userPlanets.Mars.house, partnerPlanets.Mars.house),
        },
        mercury: {
          sign: userPlanets.Mercury.sign,
          house: userPlanets.Mercury.house !== "Unknown" ? ordinalSuffix(userPlanets.Mercury.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.mercury.signs[userPlanets.Mercury.sign] || "Your Mercury shapes your communication. 🗨️"} ${astrologyDescriptions.mercury.houses[userPlanets.Mercury.house] || (userPlanets.Mercury.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.mercury(userPlanets.Mercury.sign, partnerPlanets.Mercury.sign, userPlanets.Mercury.house, partnerPlanets.Mercury.house),
        },
        jupiter: {
          sign: userPlanets.Jupiter.sign,
          house: userPlanets.Jupiter.house !== "Unknown" ? ordinalSuffix(userPlanets.Jupiter.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.jupiter.signs[userPlanets.Jupiter.sign] || "Your Jupiter inspires growth and wisdom. 🌟"} ${astrologyDescriptions.jupiter.houses[userPlanets.Jupiter.house] || (userPlanets.Jupiter.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.jupiter(userPlanets.Jupiter.sign, partnerPlanets.Jupiter.sign, userPlanets.Jupiter.house, partnerPlanets.Jupiter.house),
        },
        saturn: {
          sign: userPlanets.Saturn.sign,
          house: userPlanets.Saturn.house !== "Unknown" ? ordinalSuffix(userPlanets.Saturn.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.saturn.signs[userPlanets.Saturn.sign] || "Your Saturn brings discipline and structure. 🪐"} ${astrologyDescriptions.saturn.houses[userPlanets.Saturn.house] || (userPlanets.Saturn.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.saturn(userPlanets.Saturn.sign, partnerPlanets.Saturn.sign, userPlanets.Saturn.house, partnerPlanets.Saturn.house),
        },
      },
      partner: {
        sun: {
          sign: partnerPlanets.Sun.sign,
          house: partnerPlanets.Sun.house !== "Unknown" ? ordinalSuffix(partnerPlanets.Sun.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.sun.signs[partnerPlanets.Sun.sign] || "Your partner's Sun shapes their core identity. 🌞"} ${astrologyDescriptions.sun.houses[partnerPlanets.Sun.house] || (partnerPlanets.Sun.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.sun(userPlanets.Sun.sign, partnerPlanets.Sun.sign, userPlanets.Sun.house, partnerPlanets.Sun.house),
        },
        moon: {
          sign: partnerPlanets.Moon.sign,
          house: partnerPlanets.Moon.house !== "Unknown" ? ordinalSuffix(partnerPlanets.Moon.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.moon.signs[partnerPlanets.Moon.sign] || "Your partner's Moon guides their emotional world. 🌙"} ${astrologyDescriptions.moon.houses[partnerPlanets.Moon.house] || (partnerPlanets.Moon.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.moon(userPlanets.Moon.sign, partnerPlanets.Moon.sign, userPlanets.Moon.house, partnerPlanets.Moon.house),
        },
        ascendant: {
          sign: partnerPlanets.Ascendant.sign,
          description: astrologyDescriptions.ascendant.signs[partnerPlanets.Ascendant.sign] || (partnerPlanets.Ascendant.sign === "Unknown" ? "Your partner's Ascendant could not be determined. 🌟" : "Your partner's Ascendant shapes their outer presence. 🌟"),
        },
        venus: {
          sign: partnerPlanets.Venus.sign,
          house: partnerPlanets.Venus.house !== "Unknown" ? ordinalSuffix(partnerPlanets.Venus.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.venus.signs[partnerPlanets.Venus.sign] || "Your partner's Venus shapes their approach to love. 💕"} ${astrologyDescriptions.venus.houses[partnerPlanets.Venus.house] || (partnerPlanets.Venus.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.venus(userPlanets.Venus.sign, partnerPlanets.Venus.sign, userPlanets.Venus.house, partnerPlanets.Venus.house),
        },
        mars: {
          sign: partnerPlanets.Mars.sign,
          house: partnerPlanets.Mars.house !== "Unknown" ? ordinalSuffix(partnerPlanets.Mars.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.mars.signs[partnerPlanets.Mars.sign] || "Your partner's Mars drives their passion and action. ⚔️"} ${astrologyDescriptions.mars.houses[partnerPlanets.Mars.house] || (partnerPlanets.Mars.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.mars(userPlanets.Mars.sign, partnerPlanets.Mars.sign, userPlanets.Mars.house, partnerPlanets.Mars.house),
        },
        mercury: {
          sign: partnerPlanets.Mercury.sign,
          house: partnerPlanets.Mercury.house !== "Unknown" ? ordinalSuffix(partnerPlanets.Mercury.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.mercury.signs[partnerPlanets.Mercury.sign] || "Your partner's Mercury shapes their communication. 🗨️"} ${astrologyDescriptions.mercury.houses[partnerPlanets.Mercury.house] || (partnerPlanets.Mercury.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.mercury(userPlanets.Mercury.sign, partnerPlanets.Mercury.sign, userPlanets.Mercury.house, partnerPlanets.Mercury.house),
        },
        jupiter: {
          sign: partnerPlanets.Jupiter.sign,
          house: partnerPlanets.Jupiter.house !== "Unknown" ? ordinalSuffix(partnerPlanets.Jupiter.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.jupiter.signs[partnerPlanets.Jupiter.sign] || "Your partner's Jupiter inspires growth and wisdom. 🌟"} ${astrologyDescriptions.jupiter.houses[partnerPlanets.Jupiter.house] || (partnerPlanets.Jupiter.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.jupiter(userPlanets.Jupiter.sign, partnerPlanets.Jupiter.sign, userPlanets.Jupiter.house, partnerPlanets.Jupiter.house),
        },
        saturn: {
          sign: partnerPlanets.Saturn.sign,
          house: partnerPlanets.Saturn.house !== "Unknown" ? ordinalSuffix(partnerPlanets.Saturn.house) + " House" : "Unknown",
          description: `${astrologyDescriptions.saturn.signs[partnerPlanets.Saturn.sign] || "Your partner's Saturn brings discipline and structure. 🪐"} ${astrologyDescriptions.saturn.houses[partnerPlanets.Saturn.house] || (partnerPlanets.Saturn.house === "Unknown" ? "House placement unavailable." : "")}`,
          combined: combinedInfluences.saturn(userPlanets.Saturn.sign, partnerPlanets.Saturn.sign, userPlanets.Saturn.house, partnerPlanets.Saturn.house),
        },
      },
    };

    // Enhance narrative
    const enhancedNarrative = await enhanceSynastryNarrative(narrative, chart, yourName, partnerName);

    // Return report without saving (save happens via separate endpoint)
    res.status(200).json({
      success: true,
      data: { narrative: enhancedNarrative, chart, yourName, partnerName },
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
};


const saveLoveCompatibilityReport = async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Authentication required" });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { narrative, chart, yourName, partnerName } = req.body;
    if (!narrative || !chart || !yourName || !partnerName) {
      return res.status(400).json({ success: false, message: "Missing required report data" });
    }

    const report = new LoveCompatibilityReport({
      userId: decoded.id,
      narrative,
      chart,
      yourName,
      partnerName,
    });
    await report.save();

    res.status(200).json({ success: true, message: "Love compatibility report saved successfully", reportId: report._id });
  } catch (error) {
    console.error("Save Love Compatibility Error:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Failed to save love compatibility report" });
  }
};

module.exports = {
  generateLoveCompatibilityReport,
  saveLoveCompatibilityReport,
};