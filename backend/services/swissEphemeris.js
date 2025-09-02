const swisseph = require('swisseph');
const path = require('path');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours

// Set ephemeris path (download from https://www.astro.com/ftp/swisseph/)
swisseph.swe_set_ephe_path(path.join(__dirname, '../sweph'));

async function calculateChart(birthData) {
  const cacheKey = JSON.stringify(birthData);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  return new Promise((resolve, reject) => {
    // Convert to Julian Day
    const julianDay = swisseph.swe_julday(
      birthData.year,
      birthData.month,
      birthData.day,
      birthData.hour + birthData.min/60
    );

    // Calculate houses (Placidus system)
    swisseph.swe_houses(
      julianDay,
      birthData.lat,
      birthData.lon,
      'P', // Placidus
      (houses) => {
        
        // Calculate all planets
        const planets = {};
        const planetCodes = [
          swisseph.SE_SUN, swisseph.SE_MOON, swisseph.SE_MERCURY,
          swisseph.SE_VENUS, swisseph.SE_MARS, swisseph.SE_JUPITER,
          swisseph.SE_SATURN, swisseph.SE_URANUS, swisseph.SE_NEPTUNE,
          swisseph.SE_PLUTO, swisseph.SE_MEAN_NODE
        ];

        let planetsCalculated = 0;
        planetCodes.forEach((planet) => {
          swisseph.swe_calc_ut(
            julianDay,
            planet,
            swisseph.SEFLG_SPEED,
            (data) => {
              planets[getPlanetName(planet)] = {
                longitude: data.longitude,
                latitude: data.latitude,
                speed: data.speed
              };
              
              if (++planetsCalculated === planetCodes.length) {
                const result = { houses, planets };
                cache.set(cacheKey, result);
                resolve(result);
              }
            }
          );
        });
      }
    );
  });
}

function getPlanetName(code) {
  const names = {
    0: 'Sun', 1: 'Moon', 2: 'Mercury',
    3: 'Venus', 4: 'Mars', 5: 'Jupiter',
    6: 'Saturn', 7: 'Uranus', 8: 'Neptune',
    9: 'Pluto', 10: 'North Node'
  };
  return names[code] || 'Unknown';
}

module.exports = { calculateChart };