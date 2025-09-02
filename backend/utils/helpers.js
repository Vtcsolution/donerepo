const axios = require("axios");

const validateInput = ({
  yourName,
  yourBirthDate,
  yourBirthTime,
  yourBirthPlace,
  partnerName,
  partnerBirthDate,
  partnerBirthTime,
  partnerPlaceOfBirth,
}) => {
  const nameRegex = /^[a-zA-Z\s]+$/;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  const placeRegex = /^[a-zA-Z\s,]+$/;

  if (!yourName || !nameRegex.test(yourName)) {
    throw new Error("Invalid user name. Use letters and spaces only.");
  }
  if (!partnerName || !nameRegex.test(partnerName)) {
    throw new Error("Invalid partner name. Use letters and spaces only.");
  }
  if (!yourBirthDate || !dateRegex.test(yourBirthDate)) {
    throw new Error("Invalid user birth date. Use YYYY-MM-DD format.");
  }
  if (!partnerBirthDate || !dateRegex.test(partnerBirthDate)) {
    throw new Error("Invalid partner birth date. Use YYYY-MM-DD format.");
  }
  if (!yourBirthTime || !timeRegex.test(yourBirthTime)) {
    throw new Error("Invalid user birth time. Use HH:MM (24-hour) format.");
  }
  if (!partnerBirthTime || !timeRegex.test(partnerBirthTime)) {
    throw new Error("Invalid partner birth time. Use HH:MM (24-hour) format.");
  }
  if (!yourBirthPlace || !placeRegex.test(yourBirthPlace)) {
    throw new Error("Invalid user birth place. Use city, country format.");
  }
  if (!partnerPlaceOfBirth || !placeRegex.test(partnerPlaceOfBirth)) {
    throw new Error("Invalid partner birth place. Use city, country format.");
  }

  const [year] = yourBirthDate.split("-").map(Number);
  if (year < 1900 || year > new Date().getFullYear()) {
    throw new Error("User birth year must be between 1900 and current year.");
  }
  const [partnerYear] = partnerBirthDate.split("-").map(Number);
  if (partnerYear < 1900 || partnerYear > new Date().getFullYear()) {
    throw new Error("Partner birth year must be between 1900 and current year.");
  }
};

const validatePayload = (payload) => {
  const requiredFields = ["day", "month", "year", "hour", "min", "lat", "lon", "tzone"];
  for (const field of requiredFields) {
    if (payload[field] === undefined || payload[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  if (!Number.isInteger(payload.day) || payload.day < 1 || payload.day > 31) {
    throw new Error("Invalid day: must be 1-31");
  }
  if (!Number.isInteger(payload.month) || payload.month < 1 || payload.month > 12) {
    throw new Error("Invalid month: must be 1-12");
  }
  if (!Number.isInteger(payload.year) || payload.year < 1900 || payload.year > new Date().getFullYear()) {
    throw new Error("Invalid year: must be 1900-current year");
  }
  if (!Number.isInteger(payload.hour) || payload.hour < 0 || payload.hour > 23) {
    throw new Error("Invalid hour: must be 0-23");
  }
  if (!Number.isInteger(payload.min) || payload.min < 0 || payload.min > 59) {
    throw new Error("Invalid minute: must be 0-59");
  }
  if (typeof payload.lat !== "number" || payload.lat < -90 || payload.lat > 90) {
    throw new Error("Invalid latitude: must be -90 to 90");
  }
  if (typeof payload.lon !== "number" || payload.lon < -180 || payload.lon > 180) {
    throw new Error("Invalid longitude: must be -180 to 180");
  }
  if (typeof payload.tzone !== "number" || payload.tzone < -12 || payload.tzone > 14) {
    throw new Error("Invalid timezone: must be -12 to 14");
  }
  if (payload.house_type && !["placidus", "koch", "equal_house", "topocentric", "poryphry", "whole_sign"].includes(payload.house_type)) {
    throw new Error("Invalid house_type: must be placidus, koch, equal_house, topocentric, poryphry, or whole_sign");
  }
};

const getCoordinatesFromCity = async (city) => {
  const coordinates = {
    "amsterdam, netherlands": { latitude: 52.3730796, longitude: 4.8924534 },
  };
  const normalizedCity = city.toLowerCase().trim();
  if (coordinates[normalizedCity]) {
    return coordinates[normalizedCity];
  }
  // Optional: Integrate with a real geocoding API (e.g., OpenStreetMap Nominatim)
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`);
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    }
    throw new Error(`Coordinates not found for city: ${city}`);
  } catch (error) {
    throw new Error(`Coordinates not found for city: ${city}`);
  }
};

const getFallbackTimezoneOffset = (date, lat, lon) => {
  // Mock implementation; replace with moment-timezone or similar
  const year = Number(date.split("-")[0]);
  if (lat >= 50 && lat <= 54 && lon >= 3 && lon <= 7) { // Approx Netherlands
    return year < 1986 ? 1 : 2; // CET (UTC+1) or CEST (UTC+2)
  }
  return 0; // Default fallback
};

module.exports = {
  validateInput,
  validatePayload,
  getCoordinatesFromCity,
  getFallbackTimezoneOffset,
};