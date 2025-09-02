// In your formLogic.js (or wherever getRequiredFieldsByType is defined)
const formFieldConfigByType = {
  Astrology: ["yourName", "birthDate", "birthTime", "birthPlace"],
  Numerology: ["yourName", "birthDate"],
  Love: [
    "yourName", "yourBirthDate", "yourBirthTime", "yourBirthPlace",
    "partnerName", "partnerBirthDate", "partnerBirthTime", "partnerPlaceOfBirth"
  ],
  Tarot: []
};

const getRequiredFieldsByType = (type) => {
  return formFieldConfigByType[type] || [];
};

module.exports = { getRequiredFieldsByType };