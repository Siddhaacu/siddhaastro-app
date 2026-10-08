import { createHash } from "node:crypto";

const BASE = "https://api.navamsha.in";

const CITY_COORDS = {
  hyderabad: { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
  rajahmundry: { name: "Rajahmundry", lat: 16.9891, lon: 81.2290 },
  vijayawada: { name: "Vijayawada", lat: 16.5062, lon: 80.6480 },
  visakhapatnam: { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  tirupati: { name: "Tirupati", lat: 13.6288, lon: 79.4192 },
  bengaluru: { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  bangalore: { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  chennai: { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  mumbai: { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  delhi: { name: "Delhi", lat: 28.6139, lon: 77.2090 },
  newdelhi: { name: "Delhi", lat: 28.6139, lon: 77.2090 },
  kolkata: { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  pune: { name: "Pune", lat: 18.5204, lon: 73.8567 },
  ahmedabad: { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  kochi: { name: "Kochi", lat: 9.9312, lon: 76.2673 },
  jaipur: { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  lucknow: { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  nagpur: { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
  bhubaneswar: { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245 },
  patna: { name: "Patna", lat: 25.5941, lon: 85.1376 },
  chandigarh: { name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  gurugram: { name: "Gurugram", lat: 28.4595, lon: 77.0266 },
  surat: { name: "Surat", lat: 21.1702, lon: 72.8311 },
  indore: { name: "Indore", lat: 22.7196, lon: 75.8577 },
  coimbatore: { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  mysuru: { name: "Mysuru", lat: 12.2958, lon: 76.6394 },
  mysore: { name: "Mysuru", lat: 12.2958, lon: 76.6394 }
};

const cleanKey = value => String(value || "")
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]/g, "");

function resolveLocation(city, latitude, longitude) {
  if (Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))) {
    return {
      name: city || "Custom location",
      lat: Number(latitude),
      lon: Number(longitude)
    };
  }
  const key = cleanKey(city);
  return CITY_COORDS[key] || null;
}

function parseBirth(body) {
  const date = String(body.birthDate || "");
  const time = String(body.birthTime || "");
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes, seconds = 0] = time.split(":").map(Number);

  if (!year || !month || !day || !Number.isFinite(hours) || !Number.isFinite(minutes)) {
    throw new Error("Valid birth date and time are required.");
  }

  const location = resolveLocation(body.birthCity, body.latitude, body.longitude);
  if (!location) {
    throw new Error("Please select a valid birth place from the worldwide search results.");
  }

  return {
    year,
    month,
    date: day,
    hours,
    minutes,
    seconds: Number.isFinite(seconds) ? seconds : 0,
    latitude: location.lat,
    longitude: location.lon,
    timezone: Number.isFinite(Number(body.timezone)) ? Number(body.timezone) : Number(body.timezoneOffset ?? 5.5),
    settings: {
      ayanamsha: "lahiri",
      observation_point: "topocentric",
      language: "en"
    },
    _location: location,
    _birthDate: date,
    _birthTime: time
  };
}

async function navamsha(path, payload) {
  if (!process.env.NAVAMSHA_API_KEY) {
    throw new Error("NAVAMSHA_API_KEY is not configured in Netlify.");
  }

  const response = await fetch(BASE + path, {
    method: "POST",
    headers: {
      "X-API-Key": process.env.NAVAMSHA_API_KEY,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Navamsha returned an invalid response.");
  }

  if (!response.ok || data?.statusCode >= 400) {
    const message = data?.message || data?.error || `Navamsha API error (${response.status}).`;
    throw new Error(message);
  }

  return data?.output ?? data;
}

function hashForCache(payload) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
}

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response("", {
      status: 204,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" }
    });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const body = await request.json();
    const birth = parseBirth(body);

    const apiPayload = {
      year: birth.year,
      month: birth.month,
      date: birth.date,
      hours: birth.hours,
      minutes: birth.minutes,
      seconds: birth.seconds,
      latitude: birth.latitude,
      longitude: birth.longitude,
      timezone: birth.timezone,
      settings: birth.settings
    };

    const [chart, dasha] = await Promise.all([
      navamsha("/api/v1/kundali/basic", apiPayload),
      navamsha("/api/v1/dasha/current", apiPayload)
    ]);

    return Response.json({
      ok: true,
      cacheKey: hashForCache(apiPayload),
      calculation: {
        ayanamsha: "Lahiri",
        houseSystem: "Whole Sign",
        observationPoint: "Topocentric",
        timezone: birth.timezone
      },
      birth: {
        date: birth._birthDate,
        time: birth._birthTime,
        city: birth._location.name,
        latitude: birth.latitude,
        longitude: birth.longitude
      },
      chart,
      dasha
    }, {
      headers: {
        "Cache-Control": "private, max-age=86400"
      }
    });
  } catch (error) {
    console.error("Kundali function error:", error);
    const message = error?.message || "Unable to generate Kundali.";
    const status = message.includes("not configured") ? 503 : 400;
    return Response.json({ ok: false, error: message }, { status });
  }
}
