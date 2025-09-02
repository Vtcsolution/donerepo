
const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const OpenAI = require("openai");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const MonthlyForecastReport = require("../models/MonthlyForecastReport");
const { getCoordinatesFromCity } = require("../utils/geocode");

// Configure Axios retries
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.code === "ECONNABORTED" || error.response?.status >= 500,
});

const auth = {
  username: process.env.ASTROLOGY_API_USER_ID,
  password: process.env.ASTROLOGY_API_KEY,
};

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Default astrology descriptions as fallback
const defaultAstrologyDescriptions = {
  sun: {
    Pisces: "Je Zon in Vissen vervult je met diepe compassie, intuïtie en een dromerige geest, waardoor je je intens kunt verbinden met anderen en het universum. 🐟",
    Gemini: "Je Zon in Tweelingen ontsteekt een levendige, nieuwsgierige geest, die gedijt op aanpassingsvermogen, communicatie en een passie voor nieuwe ervaringen. 🗣️",
  },
  moon: {
    Pisces: "Je Maan in Vissen stroomt met intuïtieve empathie en spirituele diepgang, waardoor je emoties een bron van creativiteit en verbinding vormen. 🐟",
    Gemini: "Je Maan in Tweelingen brengt levendige, steeds veranderende emoties, gevoed door nieuwsgierigheid en een behoefte aan intellectuele prikkels. 🗣️",
  },
  ascendant: {
    Pisces: "Je Ascendant in Vissen straalt een meelevende, etherische aanwezigheid uit, die anderen aantrekt tot je zachte en intuïtieve aard. 🐟",
    Gemini: "Je Ascendant in Tweelingen straalt nieuwsgierigheid en charme uit, en presenteert een communicatieve en flexibele persoonlijkheid aan de wereld. 🗣️",
  },
};


async function fetchSignDescription(planet, sign) {
  try {
    console.log(`Fetching sign report for ${planet} in ${sign} from AstrologyAPI: general_sign_report/tropical/${planet}`);
    const response = await axios.post(
      `https://json.astrologyapi.com/v1/general_sign_report/tropical/${planet}`,
      { sign: sign },
      { auth }
    );
    console.log(`Sign report for ${planet} in ${sign} fetched successfully:`, JSON.stringify(response.data, null, 2));
    return response.data.description || defaultAstrologyDescriptions[planet.toLowerCase()]?.[sign] ||`Je ${planet} in ${sign} vormt je essentie met een unieke energie.`;
  } catch (error) {
    console.error(`Failed to fetch sign report for ${planet} in ${sign}:`, error.message);
return defaultAstrologyDescriptions[planet.toLowerCase()]?.[sign] || `Je ${planet} in ${sign} vormt je essentie met een unieke energie.`;
  }
}

async function enhanceNarrativeWithOpenAI(narrative, chart, forecast, transits, lifeForecast, natalInterpretation, firstName, month, year) {
  if (!openai) {
    return {
      narrative: `Beste ${firstName}, terwijl de sterren zich scharen in ${monthNames[month - 1]} ${year}, ontvouwt jouw kosmische reis zich met betekenis. Je ${chart.sun.sign} Zon verlicht je kern, je ${chart.moon.sign} Maan leidt je emoties, en je ${chart.ascendant.sign} Ascendant vormt je uitstraling. Omarm de kosmische stroom met wijsheid en gratie. 🌟`,
      forecast: {
        overview: forecast.overview || `Deze maand roept het universum je, ${firstName}, om nieuwe horizonten te omarmen. Vertrouw op je intuïtie om je pad te leiden.`,
        career: forecast.career || `Je carrière straalt van potentieel, ${firstName}. Gebruik je ${chart.sun.sign}-krachten om gedurfde kansen te grijpen, zoals het pitchen van een nieuw project.`,
        relationships: forecast.relationships || `Koester je verbindingen, ${firstName}, met de empathie van je ${chart.moon.sign} Maan. Plan een oprecht gesprek om banden te verdiepen.`,
        personalGrowth: forecast.personalGrowth || `Deze maand nodigt je uit tot zelfontdekking, ${firstName}. Reflecteer door te journalen, geleid door de visie van je ${chart.ascendant.sign} Ascendant.`,
        challenges: forecast.challenges || `Er kunnen uitdagingen ontstaan, ${firstName}. Blijf veerkrachtig met de kracht van je ${chart.sun.sign}. Oefen mindfulness om obstakels te overwinnen.`,
      },
    };
  }

  try {
    const transitSummary = transits.length > 0
      ? transits.map(t => `${t.planet} ${t.aspect} ${t.natalPlanet} op ${t.date}`).join(", ")
      : "Planetaire invloeden zijn deze maand subtiel en begeleiden je zachtjes.";
    const lifeForecastSummary = lifeForecast
      ? `Belangrijkste invloeden: ${lifeForecast.key_influences || lifeForecast.overview || "Kosmische begeleiding voor groei en balans."}`
      : "Kosmische energieën stemmen zich af om je reis te ondersteunen.";
    const natalInterpretationSummary = natalInterpretation
      ? `Kerninzichten uit je geboortehoroscoop: ${natalInterpretation.summary || natalInterpretation.ascendant_ruler || "Je horoscoop onthult een unieke mix van energieën die je pad vormen."}`
      : "Je geboortehoroscoop biedt diepe inzichten in jouw kosmische blauwdruk.";
    const prompt = `
      Jij bent een meester-astroloog die een professionele, boeiende en persoonlijke maandvoorspelling schrijft voor ${firstName} voor ${monthNames[month - 1]} ${year}. Baseer je op:
      - Zon: ${chart.sun.sign} - ${chart.sun.description}
      - Maan: ${chart.moon.sign} - ${chart.moon.description}
      - Ascendant: ${chart.ascendant.sign} - ${chart.ascendant.description}
      - Real-time transits: ${transitSummary}
      - Levensvoorspelling: ${lifeForecastSummary}
      - Geboorte-interpretatie: ${natalInterpretationSummary}

      Gebruik het meegegeven narratief en de voorspelling als vertrekpunt. Vlecht hierin hoe deze plaatsingen, transits, levensvoorspelling en geboorte-inzichten de maand vormgeven. Behandel de thema’s: overzicht, carrière, relaties, persoonlijke groei en uitdagingen. Benadruk sterke punten, uitdagingen en praktische adviezen met levendige, herkenbare voorbeelden (bijv. "Plan een koffiedate om opnieuw contact te maken met een vriend"). Gebruik een warme, spirituele en professionele toon. Houd het narratief onder 400 woorden en elk onderdeel van de voorspelling onder 100 woorden.

      Origineel Narratief: ${narrative}
      Originele Voorspelling:
      - Overzicht: ${forecast.overview || "Geen overzicht beschikbaar"}
      - Carrière: ${forecast.career || "Geen carrière-informatie beschikbaar"}
      - Relaties: ${forecast.relationships || "Geen relatie-informatie beschikbaar"}
      - Persoonlijke groei: ${forecast.personalGrowth || "Geen informatie over persoonlijke groei beschikbaar"}
      - Uitdagingen: ${forecast.challenges || "Geen uitdagingen beschikbaar"}

      Geef enkel JSON terug met de velden narrative en forecast (overview, career, relationships, personal_growth, challenges).
    `;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Je bent een warme, inzichtelijke en professionele Astrologiecoach." },
        { role: "user", content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    let responseContent = response.choices[0].message.content.trim();
    responseContent = responseContent.replace(/^```json\n|```$/g, "");
    try {
      const parsedResponse = JSON.parse(responseContent);
      if (!parsedResponse.forecast || !parsedResponse.forecast.overview) {
        parsedResponse.forecast = {
          ...parsedResponse.forecast,
          overview: forecast.overview || `Deze maand roept het universum je, ${firstName}, om nieuwe horizonten te omarmen. Vertrouw op je intuïtie om je pad te leiden.`,
        };
      }
      return parsedResponse;
    } catch (parseError) {
      console.error("Kon OpenAI-respons niet parseren:", parseError.message);
      return {
        narrative: `Beste ${firstName}, terwijl de sterren zich scharen in ${monthNames[month - 1]} ${year}, ontvouwt jouw kosmische reis zich met betekenis. Je ${chart.sun.sign} Zon verlicht je kern, je ${chart.moon.sign} Maan leidt je emoties, en je ${chart.ascendant.sign} Ascendant vormt je uitstraling. Omarm de kosmische stroom met wijsheid en gratie. 🌟`,
        forecast: {
          overview: forecast.overview || `Deze maand roept het universum je, ${firstName}, om nieuwe horizonten te omarmen. Vertrouw op je intuïtie om je pad te leiden.`,
          career: forecast.career || `Je carrière straalt van potentieel, ${firstName}. Gebruik je ${chart.sun.sign}-krachten om gedurfde kansen te grijpen, zoals het pitchen van een nieuw project.`,
          relationships: forecast.relationships || `Koester je verbindingen, ${firstName}, met de empathie van je ${chart.moon.sign} Maan. Plan een oprecht gesprek om banden te verdiepen.`,
          personalGrowth: forecast.personalGrowth || `Deze maand nodigt je uit tot zelfontdekking, ${firstName}. Reflecteer door te journalen, geleid door de visie van je ${chart.ascendant.sign} Ascendant.`,
          challenges: forecast.challenges || `Er kunnen uitdagingen ontstaan, ${firstName}. Blijf veerkrachtig met de kracht van je ${chart.sun.sign}. Oefen mindfulness om obstakels te overwinnen.`,
        },
      };
    }
  } catch (error) {
    console.error("OpenAI-fout bij verrijking:", error.message);
    return {
      narrative: `Beste ${firstName}, terwijl de sterren zich scharen in ${monthNames[month - 1]} ${year}, ontvouwt jouw kosmische reis zich met betekenis. Je ${chart.sun.sign} Zon verlicht je kern, je ${chart.moon.sign} Maan leidt je emoties, en je ${chart.ascendant.sign} Ascendant vormt je uitstraling. Omarm de kosmische stroom met wijsheid en gratie. 🌟`,
      forecast: {
        overview: forecast.overview || `Deze maand roept het universum je, ${firstName}, om nieuwe horizonten te omarmen. Vertrouw op je intuïtie om je pad te leiden.`,
        career: forecast.career || `Je carrière straalt van potentieel, ${firstName}. Gebruik je ${chart.sun.sign}-krachten om gedurfde kansen te grijpen, zoals het pitchen van een nieuw project.`,
        relationships: forecast.relationships || `Koester je verbindingen, ${firstName}, met de empathie van je ${chart.moon.sign} Maan. Plan een oprecht gesprek om banden te verdiepen.`,
        personalGrowth: forecast.personalGrowth || `Deze maand nodigt je uit tot zelfontdekking, ${firstName}. Reflecteer door te journalen, geleid door de visie van je ${chart.ascendant.sign} Ascendant.`,
        challenges: forecast.challenges || `Er kunnen uitdagingen ontstaan, ${firstName}. Blijf veerkrachtig met de kracht van je ${chart.sun.sign}. Oefen mindfulness om obstakels te overwinnen.`,
      },
    };
  }
}


async function generateMonthlyForecast(firstName, birthDate, birthTime, birthPlace, month, year) {
  console.log("Starting generateMonthlyForecast for", firstName, "for", monthNames[month - 1], year);
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  let [hour, min] = birthTime.split(":").map(Number);

  // Validate inputs
  const date = new Date(birthYear, birthMonth - 1, birthDay);
  if (isNaN(date) || date.getFullYear() !== birthYear || date.getMonth() + 1 !== birthMonth || date.getDate() !== birthDay) {
    throw new Error("Invalid birth date format. Use YYYY-MM-DD.");
  }
  if (isNaN(hour) || isNaN(min) || hour < 0 || hour > 23 || min < 0 || min > 59) {
    throw new Error("Invalid birth time format. Use HH:MM.");
  }

  // Normalize birth place
  const normalizedBirthPlace = birthPlace.trim().replace(/\s+/g, ", ");

  // Fetch coordinates
  let latitude, longitude;
  try {
    console.log("Fetching coordinates for birth place:", normalizedBirthPlace);
    const coordinates = await getCoordinatesFromCity(normalizedBirthPlace);
    ({ latitude, longitude } = coordinates);
    console.log("Coordinates fetched successfully:", { latitude, longitude });
  } catch (error) {
    if (normalizedBirthPlace.toLowerCase().includes("lahore")) {
      latitude = 31.5656822;
      longitude = 74.3141829;
      console.log("Using fallback coordinates for Lahore:", { latitude, longitude });
    } else {
      throw new Error(`Failed to fetch coordinates for birth place "${normalizedBirthPlace}". Please use a valid city and country (e.g., "Lahore, Pakistan").`);
    }
  }

  // Fetch timezone
  let tzone;
  try {
    console.log("Fetching timezone from AstrologyAPI: timezone_with_dst");
    const tzRes = await axios.post(
      "https://json.astrologyapi.com/v1/timezone_with_dst",
      { latitude, longitude, date: birthDate },
      { auth }
    );
    tzone = tzRes.data.timezone;
    console.log("Timezone fetched successfully:", tzone);
  } catch (error) {
    tzone = normalizedBirthPlace.toLowerCase().includes("amsterdam") ? 2 : 5; // CEST for Amsterdam, PKT for Lahore
    console.log("Timezone fetch failed, using fallback timezone:", tzone);
  }

  // Fetch natal chart data
  let chart;
  try {
    console.log("Fetching natal chart from AstrologyAPI: planets/tropical");
    const planetResponse = await axios.post(
      "https://json.astrologyapi.com/v1/planets/tropical",
      {
        day: Number(birthDay),
        month: Number(birthMonth),
        year: Number(birthYear),
        hour: Number(hour),
        min: Number(min),
        lat: parseFloat(latitude),
        lon: parseFloat(longitude),
        tzone: Number(tzone),
      },
      { auth }
    );
    console.log("Natal chart data fetched successfully:", JSON.stringify(planetResponse.data, null, 2));
    const planetData = Array.isArray(planetResponse.data) ? planetResponse.data : [];
    const sunData = planetData.find(planet => planet.name?.toLowerCase() === "sun") || {};
    const moonData = planetData.find(planet => planet.name?.toLowerCase() === "moon") || {};
    const ascendantData = planetData.find(planet => planet.name?.toLowerCase() === "ascendant") || {};

    const sunDescription = await fetchSignDescription("sun", sunData.sign);
    const moonDescription = await fetchSignDescription("moon", moonData.sign);
    const ascendantDescription = await fetchSignDescription("ascendant", ascendantData.sign);

    chart = {
      sun: {
        sign: sunData.sign || "Unknown",
        description: sunDescription,
      },
      moon: {
        sign: moonData.sign || "Unknown",
        description: moonDescription,
      },
      ascendant: {
        sign: ascendantData.sign || "Unknown",
        description: ascendantDescription,
      },
    };
  } catch (error) {
    console.error("Failed to fetch natal chart from AstrologyAPI:", error.message);
    chart = {
      sun: { sign: "Onbekend", description: "Je Zonneteken vormt je kernidentiteit met een unieke energie. 🌞" },
moon: { sign: "Onbekend", description: "Je Maanteken leidt je emotionele wereld met diepgang. 🌙" },
ascendant: { sign: "Onbekend", description: "Je Ascendant bepaalt hoe anderen je zien, met een eigen charme. 🌟" },
  };
  }

  // Fetch life forecast report data for transits
 // Fetch life forecast report data for transits
// Fetch life forecast report data for transits
let transits = [];
let lifeForecast = null;
try {
  console.log("Fetching life forecast report from AstrologyAPI: life_forecast_report/tropical");
  const lifeForecastResponse = await axios.post(
    "https://json.astrologyapi.com/v1/life_forecast_report/tropical",
    {
      day: Number(birthDay),
      month: Number(birthMonth),
      year: Number(birthYear),
      hour: Number(hour),
      min: Number(min),
      lat: parseFloat(latitude),
      lon: parseFloat(longitude),
      tzone: Number(tzone),
      prediction_month: Number(month),
      prediction_year: Number(year),
    },
    { auth }
  );
  console.log("Life forecast report fetched successfully:", JSON.stringify(lifeForecastResponse.data, null, 2));
  lifeForecast = lifeForecastResponse.data;

  // Fetch current planet positions for transits
  console.log("Fetching current planet positions for transits from AstrologyAPI: planets/tropical");
  const transitPlanetResponse = await axios.post(
    "https://json.astrologyapi.com/v1/planets/tropical",
    {
      day: 1, // Use first day of the prediction month
      month: Number(month),
      year: Number(year),
      hour: 0,
      min: 0,
      lat: parseFloat(latitude),
      lon: parseFloat(longitude),
      tzone: Number(tzone),
    },
    { auth }
  );
  console.log("Transit planet data fetched successfully:", JSON.stringify(transitPlanetResponse.data, null, 2));
  const transitPlanetData = Array.isArray(transitPlanetResponse.data) ? transitPlanetResponse.data : [];

  // Map life_forecast_report/tropical to transits
  if (lifeForecast?.life_forecast && Array.isArray(lifeForecast.life_forecast)) {
    transits = lifeForecast.life_forecast.map(item => {
      const match = item.planet_position.match(/Transiting (\w+) (\w+) Natal (\w+)/);
      const planetName = match ? match[1] : item.planet_position || "Unknown";
      const planetInfo = transitPlanetData.find(planet => planet.name?.toLowerCase() === planetName.toLowerCase()) || {};
      return {
        planet: match ? match[1] : item.planet_position || "Unknown",
        aspect: match ? match[2] : "Unknown",
        natalPlanet: match ? match[3] : "Unknown",
        date: item.date || `${month}-1-${year}`,
        description: item.forecast || "No specific transit details available.",
        sign: planetInfo.sign || "Unknown", // Get sign from transit planet data
        house: planetInfo.house || "Unknown", // Get house from transit planet data
      };
    });
  } else {
    console.warn("No life forecast data available, setting empty transits.");
    transits = [];
  }
  console.log("Transits mapped from life_forecast_report with planet positions:", JSON.stringify(transits, null, 2));
} catch (error) {
  console.error("Failed to fetch life forecast report or transit planet data from AstrologyAPI:", error.message);
  lifeForecast = null;
  transits = [];
}

  // Fetch natal chart interpretation
  let natalInterpretation = null;
  try {
    console.log("Fetching natal chart interpretation from AstrologyAPI: natal_chart_interpretation");
    const natalInterpretationResponse = await axios.post(
      "https://json.astrologyapi.com/v1/natal_chart_interpretation",
      {
        day: Number(birthDay),
        month: Number(birthMonth),
        year: Number(birthYear),
        hour: Number(hour),
        min: Number(min),
        lat: parseFloat(latitude),
        lon: parseFloat(longitude),
        tzone: Number(tzone),
      },
      { auth }
    );
    console.log("Natal chart interpretation fetched successfully:", JSON.stringify(natalInterpretationResponse.data, null, 2));
    natalInterpretation = natalInterpretationResponse.data;
  } catch (error) {
    console.error("Failed to fetch natal chart interpretation from AstrologyAPI:", error.message);
    natalInterpretation = null;
  }

  // Construct initial narrative and forecast
 let narrative, forecast;
try {
  narrative = `Beste ${firstName}, terwijl de sterren zich scharen in ${monthNames[month - 1]} ${year}, wordt jouw kosmische pad verlicht door dynamische transits en diepe geboorte-inzichten. Je ${chart.sun.sign} Zon, ${chart.moon.sign} Maan en ${chart.ascendant.sign} Ascendant weven een uniek verhaal dat je richting groei en vervulling leidt. 🌟`;
  forecast = {
    overview: lifeForecast?.overview || transits.length > 0
      ? `Deze maand, ${firstName}, wekken de transits van ${transits.map(t => `${t.planet} ${t.aspect} ${t.natalPlanet} op ${t.date}`).join(", ")} nieuwe kansen op. Stem af op de energie van je ${chart.sun.sign} Zon om kosmische verschuivingen te omarmen.`
      : `Deze maand nodigt het universum je uit, ${firstName}, om nieuwe horizonten te verkennen. Vertrouw op je ${chart.sun.sign} Zon om je pad te leiden.`,
    career: lifeForecast?.career || transits.find(t => t.planet.toLowerCase().includes("jupiter") || t.planet.toLowerCase().includes("saturn"))
      ? `Met ${transits.find(t => t.planet.toLowerCase().includes("jupiter") || t.planet.toLowerCase().includes("saturn")).planet} ${transits.find(t => t.planet.toLowerCase().includes("jupiter") || t.planet.toLowerCase().includes("saturn")).aspect} ${transits.find(t => t.planet.toLowerCase().includes("jupiter") || t.planet.toLowerCase().includes("saturn")).natalPlanet} op ${transits.find(t => t.planet.toLowerCase().includes("jupiter") || t.planet.toLowerCase().includes("saturn")).date}, straalt je carrière. Gebruik je ${chart.sun.sign}-krachten om te leiden, bijvoorbeeld door een gedurfd project op het werk voor te stellen.`
      : `Je loopbaan straalt, ${firstName}. Gebruik je ${chart.sun.sign} Zon om gedurfde doelen na te streven, zoals het pitchen van een nieuw idee in een vergadering.`,
    relationships: lifeForecast?.relationships || transits.find(t => t.planet.toLowerCase().includes("venus") || t.planet.toLowerCase().includes("moon"))
      ? `Met ${transits.find(t => t.planet.toLowerCase().includes("venus") || t.planet.toLowerCase().includes("moon")).planet} ${transits.find(t => t.planet.toLowerCase().includes("venus") || t.planet.toLowerCase().includes("moon")).aspect} ${transits.find(t => t.planet.toLowerCase().includes("venus") || t.planet.toLowerCase().includes("moon")).natalPlanet} op ${transits.find(t => t.planet.toLowerCase().includes("venus") || t.planet.toLowerCase().includes("moon")).date}, verdiepen je relaties. Je ${chart.moon.sign} Maan voedt empathie — plan een koffiedate om opnieuw verbinding te maken.`
      : `Koester je relaties, ${firstName}, met de empathie van je ${chart.moon.sign} Maan. Plan een oprecht gesprek om banden te versterken.`,
    personalGrowth: lifeForecast?.personalGrowth || transits.find(t => t.planet.toLowerCase().includes("uranus") || t.planet.toLowerCase().includes("neptune"))
      ? `De transit van ${transits.find(t => t.planet.toLowerCase().includes("uranus") || t.planet.toLowerCase().includes("neptune")).planet} ${transits.find(t => t.planet.toLowerCase().includes("uranus") || t.planet.toLowerCase().includes("neptune")).aspect} ${transits.find(t => t.planet.toLowerCase().includes("uranus") || t.planet.toLowerCase().includes("neptune")).natalPlanet} op ${transits.find(t => t.planet.toLowerCase().includes("uranus") || t.planet.toLowerCase().includes("neptune")).date} stimuleert groei. Houd een dagboek bij om de visie van je ${chart.ascendant.sign} Ascendant te verkennen.`
      : `Deze maand nodigt je uit tot groei, ${firstName}. Reflecteer via journaling, geleid door het unieke perspectief van je ${chart.ascendant.sign} Ascendant.`,
    challenges: lifeForecast?.challenges || transits.find(t => t.planet.toLowerCase().includes("mars") || t.planet.toLowerCase().includes("saturn"))
      ? `Met ${transits.find(t => t.planet.toLowerCase().includes("mars") || t.planet.toLowerCase().includes("saturn")).planet} ${transits.find(t => t.planet.toLowerCase().includes("mars") || t.planet.toLowerCase().includes("saturn")).aspect} ${transits.find(t => t.planet.toLowerCase().includes("mars") || t.planet.toLowerCase().includes("saturn")).natalPlanet} op ${transits.find(t => t.planet.toLowerCase().includes("mars") || t.planet.toLowerCase().includes("saturn")).date}, testen uitdagingen je veerkracht. Gebruik je ${chart.sun.sign}-kracht — oefen mindfulness om gecentreerd te blijven.`
      : `Uitdagingen kunnen je testen, ${firstName}. Blijf gegrond met de veerkracht van je ${chart.sun.sign}. Probeer diepe ademhaling om obstakels te overwinnen.`,
  };
} catch (error) {
  console.error("Fout bij opstellen initiële voorspelling:", error.message);
  narrative = `Beste ${firstName}, terwijl de sterren zich scharen in ${monthNames[month - 1]} ${year}, ontvouwt jouw kosmische reis zich met betekenis. Je pad wordt geleid door hemelse wijsheid. 🌟`;
  forecast = {
    overview: `Deze maand roept het universum je, ${firstName}, om nieuwe horizonten te verkennen. Vertrouw op je intuïtie om je pad te leiden.`,
    career: `Je carrière straalt van potentieel, ${firstName}. Gebruik je ${chart.sun.sign}-krachten om gedurfde kansen te grijpen, zoals het pitchen van een nieuw project.`,
    relationships: `Koester je verbindingen, ${firstName}, met de empathie van je ${chart.moon.sign} Maan. Plan een oprecht gesprek om banden te verdiepen.`,
    personalGrowth: `Deze maand nodigt je uit tot zelfontdekking, ${firstName}. Reflecteer via journaling, geleid door de visie van je ${chart.ascendant.sign} Ascendant.`,
    challenges: `Uitdagingen kunnen zich aandienen, ${firstName}. Blijf veerkrachtig met de kracht van je ${chart.sun.sign}. Oefen mindfulness om obstakels te overwinnen.`,
  };
}


  // Enhance narrative and forecast with OpenAI
  const { narrative: enhancedNarrative, forecast: enhancedForecast } = await enhanceNarrativeWithOpenAI(
    narrative,
    chart,
    forecast,
    transits,
    lifeForecast,
    natalInterpretation,
    firstName,
    month,
    year
  );

  const finalForecast = {
    overview: enhancedForecast.overview || forecast.overview,
    career: enhancedForecast.career || forecast.career,
    relationships: enhancedForecast.relationships || forecast.relationships,
    personalGrowth: enhancedForecast.personalGrowth || forecast.personalGrowth,
    challenges: enhancedForecast.challenges || forecast.challenges,
  };

  console.log("Final forecast generated:", JSON.stringify({ narrative: enhancedNarrative, forecast: finalForecast, transits }, null, 2));
  return { narrative: enhancedNarrative, chart, forecast: finalForecast, predictionMonth: month, predictionYear: year, transits };
}

exports.generateMonthlyForecast = async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet || wallet.credits < 5) {
      return res.status(400).json({ success: false, message: "Insufficient credits" });
    }

    if (!user.dob || !user.birthTime || !user.birthPlace) {
      return res.status(400).json({
        success: false,
        message: "Please update your profile with date of birth, birth time, and birth place",
      });
    }

    if (!user.birthTime.match(/^([01]?\d|2[0-3]):([0-5]?\d)$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid birth time format in profile. Please use HH:MM (24-hour)",
      });
    }

    const birthDate = new Date(user.dob).toISOString().split("T")[0];
    const birthTime = user.birthTime;
    const birthPlace = user.birthPlace;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    wallet.credits -= 5;
    await wallet.save();

    const reportData = await generateMonthlyForecast(user.firstName, birthDate, birthTime, birthPlace, month, year);

    const report = await MonthlyForecastReport.create({
      userId: user._id,
      narrative: reportData.narrative,
      chart: reportData.chart,
      forecast: reportData.forecast,
      predictionMonth: reportData.predictionMonth,
      predictionYear: reportData.predictionYear,
      transits: reportData.transits,
    });

    res.status(200).json({
      success: true,
      data: report,
      credits: wallet.credits,
    });
  } catch (error) {
    console.error("Generate Monthly Forecast Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message.includes("coordinates")
        ? `Invalid birth place "${user ? user.birthPlace : "unknown"}". Please use a valid city and country (e.g., "Lahore, Pakistan")`
        : error.message || "Failed to generate monthly forecast. 😔",
    });
  }
};

exports.getMonthlyForecasts = async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;

    const reports = await MonthlyForecastReport.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReports = await MonthlyForecastReport.countDocuments({ userId: user._id });

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        totalReports,
        totalPages: Math.ceil(totalReports / limit),
        hasMore: skip + reports.length < totalReports,
      },
    });
  } catch (error) {
    console.error("Get Monthly Forecasts Error:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch monthly forecasts. 😔",
    });
  }
};

exports.getMonthlyForecastById = async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { reportId } = req.params;
    if (!reportId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid report ID format" });
    }

    const report = await MonthlyForecastReport.findOne({ _id: reportId, userId: user._id });
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found or you do not have access" });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Get Monthly Forecast By ID Error:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch monthly forecast. 😔",
    });
  }
};
