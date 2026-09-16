/* Siddha Astro Panchangam data helper
 * Source: Nitya Panchangam Free API (CC-BY attribution required)
 * Hyderabad coordinates: 17.385, 78.486
 */
const PANCHANGAM_API = 'https://nityapanchangam.com/api/panchangam.php';

async function fetchPanchangam(date = new Date()) {
  const isoDate = date instanceof Date
    ? date.toISOString().slice(0, 10)
    : date;
  const url = `${PANCHANGAM_API}?date=${encodeURIComponent(isoDate)}&city=hyderabad`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Panchangam request failed: ${response.status}`);
  return response.json();
}

function formatPanchangam(data) {
  return {
    vara: data?.vara?.name || '—',
    thithi: data?.tithi?.name || '—',
    nakshatra: data?.nakshatra?.name || '—',
    yoga: data?.yoga?.name || '—',
    karana: data?.karana?.name || '—',
    masa: data?.masa?.name || data?.lunar_month || '—',
    sunrise: data?.sun?.sunrise || '—',
    sunset: data?.sun?.sunset || '—',
    rahuKalam: data?.muhurta?.rahu_kalam || '—',
    yamagandam: data?.muhurta?.yamagandam || '—',
    abhijit: data?.muhurta?.abhijit_muhurtam || '—'
  };
}

window.SiddhaPanchangam = { fetchPanchangam, formatPanchangam };
