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
function normalizeNitya(d,c){return{date:d.date,city:d.city||c.name,source:"Nitya Panchangam",attributionUrl:"https://nityapanchangam.com/api/",ayanamsa:d.ayanamsa||"Lahiri (Chitrapaksha)",vara:d.vara?.name||"—",thithi:d.tithi?.name||"—",nakshatra:d.nakshatra?`${d.nakshatra.name}${d.nakshatra.pada?` • Pada ${d.nakshatra.pada}`:""}`:"—",rashi:d.rashi?.name||d.rasi?.name||"—",samvathsara:d.samvathsara||d.samvatsara||"—",masa:d.masa?.name||d.masa||"—",yoga:d.yoga?.name||"—",karana:d.karana?.name||"—",sunrise:d.sun?.sunrise||"—",sunset:d.sun?.sunset||"—",rahuKalam:d.muhurta?.rahu_kalam||"—",yamagandam:d.muhurta?.yamagandam||"—",abhijit:d.muhurta?.abhijit_muhurtam||"—"}}
function normalizeMitra(d,c){return{date:d.date,city:d.city||c.name,source:"API Mitra",attributionUrl:"https://docs.apimitra.in/astrology/panchang/",ayanamsa:"Sidereal Panchang",vara:d.weekday||"—",thithi:[d.tithi,d.paksha?`(${d.paksha})`:""].filter(Boolean).join(" "),nakshatra:d.nakshatra||"—",rashi:d.rashi||"—",samvathsara:d.samvathsara||"—",masa:d.masa||"—",yoga:d.yoga||"—",karana:d.karana||"—",sunrise:d.sunrise||"—",sunset:d.sunset||"—",rahuKalam:d.rahu_kalam||"—",yamagandam:d.yamagandam||"—",abhijit:d.abhijit_muhurtam||"—"}}
async function fetchJson(url){const r=await fetch(url,{headers:{Accept:"application/json"}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}
async function fetchPanchangam(date=indiaToday(),city=DEFAULT_CITY){
 const c=cityConfig(city); const dateStr=typeof date==="string"?date:new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(date);
 try{const q=new URLSearchParams({date:dateStr});if(c.slug)q.set("city",c.slug);else{q.set("lat",c.lat);q.set("lng",c.lng)}return normalizeNitya(await fetchJson(`${PANCHANG_API}?${q}`),c)}
 catch(e){console.warn("Primary Panchangam source unavailable",e)}
 try{const q=new URLSearchParams({city:c.slug||"hyderabad",date:dateStr});const d=await fetchJson(`${FALLBACK_API}?${q}`);if(d?.status==="ok")return normalizeMitra(d,c)}
 catch(e){console.warn("Fallback Panchangam source unavailable",e)}
 throw new Error("Unable to load Panchangam data right now. Please try again.")
}
window.SiddhaPanchangam={fetchPanchangam,formatPanchangam:d=>d,indiaToday,cityConfig,cities:CITIES};