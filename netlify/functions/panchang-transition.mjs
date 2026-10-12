import { getPanchangam, Observer } from "@ishubhamx/panchangam-js";

export default async (req) => {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const tz = Number(url.searchParams.get("tz"));

  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date) ||
      !Number.isFinite(lat) || lat < -90 || lat > 90 ||
      !Number.isFinite(lng) || lng < -180 || lng > 180 ||
      !Number.isFinite(tz) || tz < -12 || tz > 14) {
    return new Response(JSON.stringify({ error: "Invalid date or location" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Calculate for local noon at the selected location. This avoids choosing
    // the wrong lunar segment for locations far from UTC.
    const localNoonAsUtc = Date.parse(date + "T12:00:00Z") - tz * 60 * 60 * 1000;
    const observer = new Observer(lat, lng, 0);
    const result = getPanchangam(new Date(localNoonAsUtc), observer, {
      timezoneOffset: Math.round(tz * 60)
    });

    const tithiStartTime = result?.tithiStartTime;
    const tithiEndTime = result?.tithiEndTime;
    const nakshatraStartTime = result?.nakshatraStartTime;
    const nakshatraEndTime = result?.nakshatraEndTime;

    return new Response(JSON.stringify({
      tithiTiming: formatRange(tithiStartTime, tithiEndTime, tz),
      nakshatraTiming: formatRange(nakshatraStartTime, nakshatraEndTime, tz),
      timingSource: "Offline Panchangam calculation"
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public,max-age=3600"
      }
    });
  } catch (error) {
    console.error("Transition timing calculation error", error);
    return new Response(JSON.stringify({ error: "Unable to calculate transition timings" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

function formatRange(start, end, offsetHours) {
  const startLabel = formatTime(start, offsetHours);
  const endLabel = formatTime(end, offsetHours);
  if (!endLabel) return "";
  return startLabel ? startLabel + " – " + endLabel : endLabel;
}

function formatTime(value, offsetHours) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const shifted = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
  let hour = shifted.getUTCHours();
  const minute = shifted.getUTCMinutes();
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return hour + ":" + String(minute).padStart(2, "0") + " " + period;
}
