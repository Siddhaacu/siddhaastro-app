/* Siddha Astro Panchangam data helper
 * Source: Nitya Panchangam Free API (CC-BY attribution required)
 * Hyderabad coordinates: 17.385, 78.486
 */
const PANCHANGAM_API = 'https://nityapanchangam.com/api/panchangam.php';

const MASA_NAMES = {
  chaitra: ['చైత్ర మాసం', 'Chaitra Masam'],
  vaishakha: ['వైశాఖ మాసం', 'Vaishakha Masam'],
  vaisakha: ['వైశాఖ మాసం', 'Vaishakha Masam'],
  jyestha: ['జ్యేష్ఠ మాసం', 'Jyeshtha Masam'],
  jyeshtha: ['జ్యేష్ఠ మాసం', 'Jyeshtha Masam'],
  ashadha: ['ఆషాఢ మాసం', 'Ashadha Masam'],
  sravana: ['శ్రావణ మాసం', 'Shravana Masam'],
  bhadrapada: ['భాద్రపద మాసం', 'Bhadrapada Masam'],
  ashwina: ['ఆశ్వయుజ మాసం', 'Ashwayuja Masam'],
  ashwin: ['ఆశ్వయుజ మాసం', 'Ashwayuja Masam'],
  kartika: ['కార్తీక మాసం', 'Kartika Masam'],
  margashirsha: ['మార్గశిర మాసం', 'Margashirsha Masam'],
  margashira: ['మార్గశిర మాసం', 'Margashira Masam'],
  pushya: ['పుష్య మాసం', 'Pushya Masam'],
  pausha: ['పుష్య మాసం', 'Pushya Masam'],
  magha: ['మాఘ మాసం', 'Magha Masam'],
  phalguna: ['ఫాల్గుణ మాసం', 'Phalguna Masam']
};

function cleanKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z]/g, '');
}

function formatMasa(data) {
  const masa = data?.masa || data?.month || {};
  const raw = masa?.name || masa?.english || masa?.month || data?.lunar_month || data?.masa_name || '';
  const key = cleanKey(raw);
  const mapped = Object.entries(MASA_NAMES).find(([name]) => key.includes(name));
  const english = mapped ? mapped[1][1] : (raw || 'Masa unavailable');
  const telugu = mapped ? mapped[1][0] : (masa?.telugu || data?.lunar_month_telugu || 'మాసం సమాచారం లేదు');
  const type = masa?.type || masa?.amanta || data?.masa_type || '';
  const suffix = /adhika|extra/i.test(String(type)) ? ' (అధిక / Adhika)' : '';
  return `${telugu}${suffix} • ${english}${suffix}`;
}

async function fetchPanchangam(date = new Date()) {
  const isoDate = date instanceof Date ? date.toISOString().slice(0, 10) : date;
  const url = `${PANCHANGAM_API}?date=${encodeURIComponent(isoDate)}&city=hyderabad`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Panchangam request failed: ${response.status}`);
  return response.json();
}

function formatPanchangam(data) {
  return {
    vara: data?.vara?.name || data?.vara || '—',
    thithi: data?.tithi?.name || data?.tithi || '—',
    nakshatra: data?.nakshatra?.name || data?.nakshatra || '—',
    yoga: data?.yoga?.name || data?.yoga || '—',
    karana: data?.karana?.name || data?.karana || '—',
    masa: formatMasa(data),
    sunrise: data?.sun?.sunrise || data?.sunrise || '—',
    sunset: data?.sun?.sunset || data?.sunset || '—',
    rahuKalam: data?.muhurta?.rahu_kalam || data?.rahu_kalam || '—',
    yamagandam: data?.muhurta?.yamagandam || data?.yamagandam || '—',
    abhijit: data?.muhurta?.abhijit_muhurtam || data?.abhijit_muhurtam || '—'
  };
}

window.SiddhaPanchangam = { fetchPanchangam, formatPanchangam };
