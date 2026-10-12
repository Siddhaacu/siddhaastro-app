export default async (req) => {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const city = url.searchParams.get("city") || "hyderabad";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^[a-z]+$/.test(city)) {
    return new Response(JSON.stringify({ error: "Invalid date or city" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const previousDate = (() => {
    const p = date.split("-").map(Number);
    const d = new Date(Date.UTC(p[0], p[1] - 1, p[2] - 1));
    return d.toISOString().slice(0, 10);
  })();

  const fetchDay = async (d) => {
    const r = await fetch("https://shastrapanchangam.com/api/v1/day/" + city + "/" + d + ".json");
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  };

  try {
    const [today, previous] = await Promise.all([
      fetchDay(date),
      fetchDay(previousDate)
    ]);

    const t = today?.day || {};
    const p = previous?.day || {};

    return new Response(JSON.stringify({
      tithiTiming: formatRange(minutesToTime(p.tithi_ends), minutesToTime(t.tithi_ends)),
      nakshatraTiming: formatRange(minutesToTime(p.nakshatra_ends), minutesToTime(t.nakshatra_ends)),
      timingSource: "Shastra Panchangam"
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public,max-age=3600"
      }
    });
  } catch (e) {
    console.error("Transition timing error", e);
    return new Response(JSON.stringify({ error: "Unable to load transition timings" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

function minutesToTime(value) {
  if (value == null) return null;
  if (typeof value === "object") {
    return minutesToTime(value.minutes ?? value.end_local ?? value.endLocal ?? value.end ?? value.time);
  }

  let minutes;
  if (typeof value === "number" && Number.isFinite(value)) {
    minutes = Math.round(value) % 1440;
    if (minutes < 0) minutes += 1440;
  } else {
    const raw = String(value).trim();
    if (!raw) return null;

    // Accept ISO timestamps returned by some versions of the day API.
    const iso = raw.match(/T(\\d{2}):(\\d{2})/);
    if (iso) {
      minutes = Number(iso[1]) * 60 + Number(iso[2]);
    } else if (/^\\d+(?:\\.\\d+)?$/.test(raw)) {
      minutes = Math.round(Number(raw)) % 1440;
      if (minutes < 0) minutes += 1440;
    } else {
      const time = raw.match(/(\\d{1,2}):(\\d{2})(?::\\d{2})?\\s*(am|pm)?/i);
      if (!time) return null;
      let hour = Number(time[1]);
      const minute = Number(time[2]);
      if (time[3]) {
        const period = time[3].toLowerCase();
        if (period === "pm" && hour < 12) hour += 12;
        if (period === "am" && hour === 12) hour = 0;
      }
      if (hour > 23 || minute > 59) return null;
      minutes = hour * 60 + minute;
    }
  }

  let h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return h + ":" + String(m).padStart(2, "0") + " " + ap;
}

function formatRange(start, end) {
  return end ? (start ? start + " – " : "") + end : "";
}
