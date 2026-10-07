/* Siddha Astro — Dynamic Panchangam
   Primary: Nitya Panchangam (Lahiri / Chitrapaksha)
   Fallback: API Mitra
   One normalized data shape is shared by Home and Panchangam.
*/
const PANCHANG_API="https://nityapanchangam.com/api/panchangam.php";
const FALLBACK_API="https://api.apimitra.in/panchang";
const ENRICH_API="https://jagannatha-hora-359167915530.europe-west1.run.app/panchang";
const CITIES={
 hyderabad:{name:"Hyderabad",lat:17.385,lng:78.486,slug:"hyderabad"},
 bangalore:{name:"Bengaluru",lat:12.9716,lng:77.5946,slug:"bangalore"},
 chennai:{name:"Chennai",lat:13.0827,lng:80.2707,slug:"chennai"},
 mumbai:{name:"Mumbai",lat:19.076,lng:72.8777,slug:"mumbai"},
 delhi:{name:"Delhi",lat:28.6139,lng:77.209,slug:"delhi"},
 rajahmundry:{name:"Rajahmundry",lat:16.9891,lng:81.2292,slug:null}
};
const DEFAULT_CITY="hyderabad";

function indiaToday(){
  return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
}

function cityConfig(city=DEFAULT_CITY){
  if(typeof city==="object"&&city)return city;
  return CITIES[String(city).toLowerCase()]||CITIES[DEFAULT_CITY];
}

function normalizePrimary(d,c){
  return {
    date:d.date,
    city:c.name,
    source:"Nitya Panchangam",
    attributionUrl:"https://nityapanchangam.com/api/",
    ayanamsa:d.ayanamsa||"Lahiri (Chitrapaksha)",
    vara:d.vara?.name||d.vara||"—",
    thithi:d.tithi?.name||"—",
    nakshatra:d.nakshatra?.name||"—",
    rashi:d.rashi?.name||d.rashi||"Not provided",
    samvathsara:d.samvathsara||d.samvatsara||"Not provided",
    masa:d.masa?.name||d.masa||"Not provided",
    yoga:d.yoga?.name||"—",
    karana:d.karana?.name||"—",
    sunrise:d.sun?.sunrise||d.sunrise||"—",
    sunset:d.sun?.sunset||d.sunset||"—",
    rahuKalam:d.muhurta?.rahu_kalam||d.rahuKalam||"—",
    yamagandam:d.muhurta?.yamagandam||d.yamagandamKalam||d.yamagandam||"—",
    abhijit:d.muhurta?.abhijit_muhurtam||d.abhijitMuhurtham||d.abhijit||"—"
  };
}

function normalizeFallback(d,c){
  return {
    date:d.date,
    city:d.city||c.name,
    source:"API Mitra",
    attributionUrl:"https://api.apimitra.in/",
    ayanamsa:d.ayanamsa||"Lahiri / Sidereal",
    vara:d.vara?.name||d.vara||"—",
    thithi:d.tithi?.name||"—",
    nakshatra:d.nakshatra?.name||"—",
    rashi:d.rashi?.name||d.rashi||"Not provided",
    samvathsara:d.samvathsara||d.samvatsara||"Not provided",
    masa:d.masa?.name||d.masa||"Not provided",
    yoga:d.yoga?.name||"—",
    karana:d.karana?.name||"—",
    sunrise:d.sun?.sunrise||d.sunrise||"—",
    sunset:d.sun?.sunset||d.sunset||"—",
    rahuKalam:d.muhurta?.rahu_kalam||d.rahuKalam||"—",
    yamagandam:d.muhurta?.yamagandam||d.yamagandam||"—",
    abhijit:d.muhurta?.abhijit_muhurtam||d.abhijit||"—"
  };
}

async function fetchJson(url){
  const r=await fetch(url,{headers:{Accept:"application/json"}});
  if(!r.ok)throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function enrichCalendarIdentity(base,dateStr,c){
  if(base.rashi!=="Not provided"&&base.samvathsara!=="Not provided"&&base.masa!=="Not provided")return base;
  try{
    const r=await fetch(ENRICH_API,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({date:dateStr,latitude:c.lat,longitude:c.lng,timezone:5.5,ayanamsa_mode:"LAHIRI"})});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const j=await r.json();
    const p=j?.panchang;
    if(!p)return base;
    return {...base,
      rashi:p.signs?.moon?.name||base.rashi,
      samvathsara:p.samvat?.samvatsara_name||base.samvathsara,
      masa:p.month?.amanta||base.masa
    };
  }catch(e){
    console.warn("Calendar identity enrichment unavailable",e);
    return base;
  }
}

async function fetchPanchangam(date=indiaToday(),city=DEFAULT_CITY){
  const c=cityConfig(city);
  const dateStr=typeof date==="string"
    ?date
    :new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(date);

  try{
    const q=new URLSearchParams({date:dateStr,city:c.slug||"hyderabad"});
    const d=await fetchJson(`${PANCHANG_API}?${q}`);
    if(d?.date)return enrichCalendarIdentity(normalizePrimary(d,c),dateStr,c);
  }catch(e){
    console.warn("Primary Panchang source unavailable",e);
  }

  try{
    const q=new URLSearchParams({date:dateStr,city:c.slug||"hyderabad"});
    const d=await fetchJson(`${FALLBACK_API}?${q}`);
    if(d?.date)return enrichCalendarIdentity(normalizeFallback(d,c),dateStr,c);
  }catch(e){
    console.warn("Fallback Panchang source unavailable",e);
  }

  throw new Error("Unable to load Panchangam data right now. Please try again.");
}

window.SiddhaPanchangam={
  fetchPanchangam,
  formatPanchangam:d=>d,
  indiaToday,
  cityConfig,
  cities:CITIES
};