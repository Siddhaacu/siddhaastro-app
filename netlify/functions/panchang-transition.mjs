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

  const prevDate = (() => {
    const p = date.split("-").map(Number);
    const d = new Date(Date.UTC(p[0], p[1] - 1, p[2] - 1));
    return d.toISOString().slice(0, 10);
  })();

  const page = async (d) => {
    const r = await fetch("https://shastrapanchangam.com/en/panchangam/" + city + "/" + d + "/");
    if (!r.ok) throw new Error("HTTP " + r.status);
    return cleanText(await r.text());
  };

  try {
    const [today, prev] = await Promise.all([page(date), page(prevDate)]);
    const tithiEnd = extractEnd(today, "Tithi");
    const nakshatraEnd = extractEnd(today, "Nakshatra");
    const previousTithiEnd = extractEnd(prev, "Tithi");
    const previousNakshatraEnd = extractEnd(prev, "Nakshatra");

    return new Response(JSON.stringify({
      tithiTiming: formatRange(previousTithiEnd, tithiEnd),
      nakshatraTiming: formatRange(previousNakshatraEnd, nakshatraEnd),
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

function cleanText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&middot;/gi, "·")
    .replace(/\s+/g, " ")
    .trim();
}

function extractEnd(text, kind) {
  const re = new RegExp(
    kind + "\\s*[·:.-]?\\s*[^.]{0,100}?\\s+until\\s+(\\d{1,2}:\\d{2}\\s*(?:am|pm))(?:\\s+(?:next|the)\\s+day)?",
    "i"
  );
  const m = text.match(re);
  return m ? m[1].replace(/\s+/g, " ").toUpperCase() : null;
}

function formatRange(start, end) {
  return end ? (start ? start + " – " : "") + end : "";
}
