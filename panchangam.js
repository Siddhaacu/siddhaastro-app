/* Siddha Astro — Dynamic Panchangam
   Primary: Nitya Panchangam (Lahiri / Chitrapaksha)
   Fallback: API Mitra
   One normalized data shape is shared by Home and Panchangam.
*/
const PANCHANG_API="https://nityapanchangam.com/api/panchangam.php";
const FALLBACK_API="https://api.apimitra.in/panchang";
const CITIES={
 hyderabad:{name:"Hyderabad",lat:17.385,lng:78.486,slug:"hyderabad"},
 bangalore:{name:"Bengaluru",lat:12.9716,lng:77.5946,slug:"bangalore"},
 chennai:{name:"Chennai",lat:13.0827,lng:80.2707,slug:"chennai"},
 mumbai:{name:"Mumbai",lat:19.076,lng:72.8777,slug:"mumbai"},
 delhi:{name:"Delhi",lat:28.6139,lng:77.209,slug:"delhi"},
 rajahmundry:{name:"Rajahmundry",lat:16.9891,lng:81.2292,slug:null}
};
const DEFAULT_CITY="hyderabad";
function indiaToday(){return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date())}
function cityConfig(city=DEFAULT_CITY){if(typeof city==="object"&&city)return city;return CITIES[String(city).toLowerCase()]||CITIES[DEFAULT_CITY]}
functifunction normalizePrimary(d,c){return{date:d.date,city:c.name,source:"ShubhAI Panchang",attributionUrl:"https://www.shubh.live/developers",ayanamsa:"Lahiri / Sidereal",vara:d.vara?.name||d.weekday||"—",thithi:[d.tithi?.name,d.tithi?.paksha?("(" + d.tithi.paksha + ")"):""].filter(Boolean).join(" "),nakshatra:d.nakshatra?.name?(d.nakshatra.name+(d.nakshatra.pada?" • Pada "+d.nakshatra.pada:"")):"—",rashi:d.moonRashi?.en||d.moonRashi?.sa||d.rashi||"—",samvathsara:d.samvat?.samvatsara||d.samvatsara||"—",masa:d.lunarMonth?.amanta||d.lunarMonth?.name||d.masa||"—",yoga:d.yoga?.name||"—",karana:d.karana?.name||"—",sunrise:d.sunrise?new Date(d.sunrise).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit",hour12:true,timeZone:"Asia/Kolkata"}):"—",sunset:d.sunset?new Date(d.sunset).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit",hour12:true,timeZone:"Asia/Kolkata"}):"—",rahuKalam:d.rahuKalam||d.rahu_kalam||"—",yamagandam:d.yamagandam||d.yamagandamKalam||"—",abhijit:d.abhijit||d.abhijitMuhurtham||"—"}}
function normalizeFallback(d,c){return{date:d.date,city:d.city||c.name,source:"Nitya Panchangam",attributionUrl:"https://nityapanchangam.com/api/",ayanamsa:d.ayanamsa||"Lahiri (Chitrapaksha)",vara:d.vara?.name||"—",thithi:d.tithi?.name||"—",nakshatra:d.nakshatra?.name||"—",rashi:d.rashi?.name||"Not provided",samvathsara:d.samvathsara||d.samvatsara||"Not provided",masa:d.masa?.name||d.masa||"Not provided",yoga:d.yoga?.name||"—",karana:d.karana?.name||"—",sunrise:d.sun?.sunrise||"—",sunset:d.sun?.sunset||"—",rahuKalam:d.muhurta?.rahu_kalam||"—",yamagandam:d.muhurta?.yamagandam||"—",abhijit:d.muhurta?.abhijit_muhurtam||"—"}}

function fetchJson(url){const r=await fetch(url,{headers:{Accept:"application/json"}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}
async function fetchPanchangam(date=indiaToday(),city=DEFAULT_CITY){const c=cityConfig(city);const dateStr=typeof date==="string"?date:new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(date);try{const q=new URLSearchParams({date:dateStr,lat:c.lat,lon:c.lng});const d=await fetchJson(`${PANCHANG_API}?${q}`);if(d?.date)return normalizePrimary(d,c)}catch(e){console.warn("Primary Panchang source unavailable",e)}try{const q=new URLSearchParams({date:dateStr,city:c.slug||"hyderabad"});const d=await fetchJson(`${FALLBACK_API}?${q}`);if(d?.date)return normalizeFallback(d,c)}catch(e){console.warn("Fallback Panchang source unavailable",e)}throw new Error("Unable to load Panchangam data right now. Please try again.")}
window.SiddhaPanchangam={fetchPanchangam,formatPanchangam:d=>d,indiaToday,cityConfig,cities:CITIES};