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
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  let minutes = Math.round(value) % 1440;
  if (minutes < 0) minutes += 1440;
  let h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return h + ":" + String(m).padStart(2, "0") + " " + ap;
}

function formatRange(start, end) {
  return end ? (start ? start + " – " : "") + end : "";
}
