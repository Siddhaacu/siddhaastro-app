/* Siddha Astro - Universal Panchangam Helper with Free APIs and Local Calculations */

// ============================================
// MULTIPLE FREE API OPTIONS
// ============================================

const APIs = {
  // Option 1: Local Calculation Engine (Always Free, No API Key Needed)
  LOCAL: 'local',
  
  // Option 2: Weatherapi.com (Free tier - astronomy data)
  WEATHERAPI: 'https://api.weatherapi.com/v1/astronomy.json',
  
  // Option 3: Open-Meteo (Completely Free, No API Key)
  OPENMETEO: 'https://api.open-meteo.com/v1/astronomy',
};

// Use LOCAL calculation as primary (free, no rate limits)
const PRIMARY_API = APIs.LOCAL;
const FALLBACK_APIs = [APIs.OPENMETEO, APIs.WEATHERAPI];

// Weather API key (free tier) - optional
const WEATHERAPI_KEY = 'your-free-key'; // Register at weatherapi.com for free

// ============================================
// LOCAL PANCHANGAM CALCULATION ENGINE
// ============================================

const TELUGU = {
  mesha: ['మేష రాశి', 'Mesha Rashi'],
  vrishabha: ['వృషభ రాశి', 'Vrishabha Rashi'],
  mithuna: ['మిథున రాశి', 'Mithuna Rashi'],
  karkataka: ['కర్కాటక రాశి', 'Karkataka Rashi'],
  simha: ['సింహ రాశి', 'Simha Rashi'],
  kanya: ['కన్యా రాశి', 'Kanya Rashi'],
  tula: ['తులా రాశి', 'Tula Rashi'],
  vrischika: ['వృశ్చిక రాశి', 'Vrishchika Rashi'],
  dhanu: ['ధనుస్సు రాశి', 'Dhanu Rashi'],
  makara: ['మకర రాశి', 'Makara Rashi'],
  kumbha: ['కుంభ రాశి', 'Kumbha Rashi'],
  meena: ['మీన రాశి', 'Meena Rashi']
};

const VARAS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TITHIS = [
  'Shukla Pratipada', 'Shukla Dwitiya', 'Shukla Tritiya', 'Shukla Chaturthi', 'Shukla Panchami',
  'Shukla Shashthi', 'Shukla Saptami', 'Shukla Ashtami', 'Shukla Navami', 'Shukla Dashami',
  'Shukla Ekadashi', 'Shukla Dwadashi', 'Shukla Trayodashi', 'Shukla Chaturdashi', 'Purnima',
  'Krishna Pratipada', 'Krishna Dwitiya', 'Krishna Tritiya', 'Krishna Chaturthi', 'Krishna Panchami',
  'Krishna Shashthi', 'Krishna Saptami', 'Krishna Ashtami', 'Krishna Navami', 'Krishna Dashami',
  'Krishna Ekadashi', 'Krishna Dwadashi', 'Krishna Trayodashi', 'Krishna Chaturdashi', 'Amavasya'
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha',
  'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const YOGAS = [
  'Vaidhriti', 'Vaidhiriti', 'Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Sattva', 'Siddhayoga', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
];

const KARANAS = [
  'Kava', 'Balava', 'Kaulava', 'Taitula', 'Gara', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada',
  'Naga', 'Kimstughna', 'Shakuni', 'Chatushpada'
];

const MASAS = [
  'Chaitra', 'Vaisakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada',
  'Ashwin', 'Kartik', 'Margshirsh', 'Paush', 'Magh', 'Phalgun'
];

const RASHIS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karkataka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

// ============================================
// LOCAL PANCHANGAM CALCULATION
// ============================================

function calculateLocalPanchangam(date = new Date()) {
  // Hyderabad coordinates (default)
  const lat = 17.385;
  const lon = 78.4867;

  // Calculate JD (Julian Day)
  const jd = calculateJulianDay(date);

  // Calculate Vara (Day of week)
  const vara = VARAS[date.getDay()];

  // Calculate Tithi (Lunar day)
  const lunarDay = calculateLunarDay(jd);
  const tithi = TITHIS[Math.floor(lunarDay % 30)];

  // Calculate Nakshatra (Star)
  const moonLongitude = calculateMoonLongitude(jd);
  const nakshatra = calculateNakshatra(moonLongitude);

  // Calculate Rashi (Moon sign)
  const rashi = calculateRashi(moonLongitude);

  // Calculate Sunrise/Sunset
  const sunTimes = calculateSunriseSunset(date, lat, lon);

  // Calculate Yoga and Karana
  const yoga = YOGAS[Math.floor((lunarDay + calculateSunLongitude(jd)) / 13.3) % 27];
  const karana = KARANAS[Math.floor((lunarDay % 30) / 2.4) % 11];

  // Calculate Masa (Month)
  const masa = MASAS[(date.getMonth() + 9) % 12]; // Adjusted for Hindu calendar

  // Calculate Rahu Kalam (avoid time)
  const rahuKalam = calculateRahuKalam(date);

  // Calculate Yamagandam
  const yamagandam = calculateYamagandam(date);

  // Calculate Abhijit Muhurtham
  const abhijit = calculateAbhijitMuhurtham(date);

  // Calculate Samvatsara
  const samvatsara = calculateSamvatsara(date);

  return {
    vara: vara,
    thithi: tithi,
    nakshatra: nakshatra,
    rashi: rashi,
    yoga: yoga,
    karana: karana,
    masa: masa,
    samvathsara: samvatsara,
    sunrise: sunTimes.sunrise,
    sunset: sunTimes.sunset,
    rahuKalam: rahuKalam,
    yamagandam: yamagandam,
    abhijit: abhijit
  };
}

function calculateJulianDay(date) {
  const a = Math.floor((14 - date.getMonth() - 1) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = date.getMonth() + 1 + 12 * a - 3;
  return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function calculateMoonLongitude(jd) {
  // Simplified moon longitude calculation
  const d = jd - 2451545.0;
  const L = (218.316 + 13.176396 * d) % 360;
  const M = (134.963 + 13.064993 * d) % 360;
  const F = (93.272 + 13.229350 * d) % 360;
  let longitude = L + 6.289 * Math.sin(M * Math.PI / 180);
  longitude = (longitude + 360) % 360;
  return longitude;
}

function calculateSunLongitude(jd) {
  const d = jd - 2451545.0;
  const L = (280.461 + 36000.771 * d / 100) % 360;
  const M = (357.529 + 35999.050 * d / 100) % 360;
  let longitude = L + 1.915 * Math.sin(M * Math.PI / 180) + 0.020 * Math.sin(2 * M * Math.PI / 180);
  longitude = (longitude + 360) % 360;
  return longitude;
}

function calculateNakshatra(moonLongitude) {
  const nakshatraLength = 360 / 27;
  const index = Math.floor(moonLongitude / nakshatraLength) % 27;
  return NAKSHATRAS[index];
}

function calculateRashi(moonLongitude) {
  const rashiLength = 30;
  const index = Math.floor(moonLongitude / rashiLength) % 12;
  return RASHIS[index];
}

function calculateLunarDay(jd) {
  const moonLong = calculateMoonLongitude(jd);
  const sunLong = calculateSunLongitude(jd);
  let age = (moonLong - sunLong + 360) % 360;
  return age / 12; // Each tithi = 12 degrees
}

function calculateSunriseSunset(date, lat, lon) {
  // Simplified sunrise/sunset calculation
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const baseSunrise = 6; // 6 AM
  const baseSunset = 18; // 6 PM
  const seasonalShift = Math.sin((dayOfYear - 80) * Math.PI / 182) * 1.5;

  const sunrise = (baseSunrise + seasonalShift).toFixed(2);
  const sunset = (baseSunset + seasonalShift).toFixed(2);

  return {
    sunrise: Math.floor(sunrise) + ':' + String(Math.round((sunrise % 1) * 60)).padStart(2, '0'),
    sunset: Math.floor(sunset) + ':' + String(Math.round((sunset % 1) * 60)).padStart(2, '0')
  };
}

function calculateRahuKalam(date) {
  const day = date.getDay();
  const rahuHour = [8, 3, 6, 9, 12, 15, 18][day];
  return rahuHour + ':00 - ' + (rahuHour + 1) + ':30';
}

function calculateYamagandam(date) {
  const day = date.getDay();
  const yamaHour = [12, 4, 2, 8, 10, 14, 16][day];
  return yamaHour + ':00 - ' + (yamaHour + 1) + ':30';
}

function calculateAbhijitMuhurtham(date) {
  const sunTimes = calculateSunriseSunset(date, 17.385, 78.4867);
  const baseHour = 12;
  return baseHour + ':00 - ' + (baseHour + 1) + ':30 (Noon)';
}

function calculateSamvatsara(date) {
  const year = date.getFullYear() - 1979;
  const samvatsaras = [
    'Prabhava', 'Vibhava', 'Shukla', 'Pramoda', 'Prajapati', 'Angirasa', 'Shrimukha',
    'Bhava', 'Yuva', 'Dhata', 'Ishvara', 'Bahudhanya', 'Pramathi', 'Vikrama', 'Vrisha',
    'Chitrabhanu', 'Swabhanu', 'Tarana', 'Parthiva', 'Vyaya', 'Sarvajit', 'Sarvadharin',
    'Virodhi', 'Vikrita', 'Khara', 'Nandana', 'Vijaya', 'Jaya', 'Manmatha', 'Durmukha',
    'Hevilambi', 'Villambi', 'Vikari', 'Sharvari', 'Plava', 'Shubhakrit', 'Sobhakrit',
    'Krodhi', 'Visvavasu', 'Parabhava', 'Plavanga', 'Keelaka', 'Saumya', 'Sadharana',
    'Virodhikrit', 'Paridhavi', 'Pramadeesa', 'Ananda', 'Rakshasa', 'Nala', 'Pingala',
    'Kalayukti', 'Siddhartha', 'Raudra', 'Durmati', 'Dundubhi', 'Rudhirodgari', 'Raktakshi',
    'Krodhana', 'Akshaya'
  ];
  return samvatsaras[year % 60];
}

// ============================================
// FALLBACK: OPENMETEO FREE API
// ============================================

async function fetchFromOpenMeteo(date, lat = 17.385, lon = 78.4867) {
  try {
    const dateStr = date.toISOString().split('T')[0];
    const url = `${APIs.OPENMETEO}?latitude=${lat}&longitude=${lon}&date=${dateStr}&timezone=auto`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    
    return {
      sunrise: data.daily.sunrise[0],
      sunset: data.daily.sunset[0],
      moonrise: data.daily.moonrise[0],
      moonset: data.daily.moonset[0],
      moonphase: data.daily.moon_phase[0]
    };
  } catch (error) {
    console.error('OpenMeteo API error:', error);
    return null;
  }
}

// ============================================
// UNIVERSAL FORMAT FUNCTION
// ============================================

function formatPanchangam(data) {
  if (!data) return null;

  return {
    vara: data.vara || '—',
    thithi: data.thithi || '—',
    nakshatra: data.nakshatra || '—',
    rashi: data.rashi ? formatRashi(data.rashi) : '—',
    samvathsara: data.samvathsara || '—',
    masa: data.masa || '—',
    yoga: data.yoga || '—',
    karana: data.karana || '—',
    sunrise: data.sunrise || '—',
    sunset: data.sunset || '—',
    rahuKalam: data.rahuKalam || '—',
    yamagandam: data.yamagandam || '—',
    abhijit: data.abhijit || '—'
  };
}

function formatRashi(rashiName) {
  if (!rashiName) return '—';
  const lower = rashiName.toLowerCase();
  for (const [key, value] of Object.entries(TELUGU)) {
    if (lower.includes(key)) {
      return `${value[0]} • ${value[1]}`;
    }
  }
  return rashiName;
}

// ============================================
// MAIN FETCH FUNCTION (Auto-fallback)
// ============================================

async function fetchPanchangam(date = new Date()) {
  try {
    // PRIMARY: Use local calculation (always works, no API key needed)
    const localData = calculateLocalPanchangam(date);
    
    if (localData) {
      return formatPanchangam(localData);
    }
  } catch (error) {
    console.warn('Local calculation error:', error);
  }

  // FALLBACK: Try OpenMeteo
  try {
    const openMeteoData = await fetchFromOpenMeteo(date);
    if (openMeteoData) {
      const localData = calculateLocalPanchangam(date);
      return formatPanchangam({...localData, ...openMeteoData});
    }
  } catch (error) {
    console.warn('OpenMeteo fallback error:', error);
  }

  // If all fail, return local calculation anyway
  const localData = calculateLocalPanchangam(date);
  return formatPanchangam(localData);
}

// ============================================
// EXPORT
// ============================================

window.SiddhaPanchangam = {
  fetchPanchangam,
  formatPanchangam,
  calculateLocalPanchangam
};
