/* Siddha Astro — Dynamic Panchangam
   Primary: Nitya Panchangam (Lahiri / Chitrapaksha)
   Fallback: API Mitra
   One normalized data shape is shared by Home and Panchangam.
*/
const PANCHANG_API="https://nityapanchangam.com/api/panchangam.php";
const FALLBACK_API="https://api.apimitra.in/panchang";
const ENRICH_API="https://jagannatha-hora-359167915530.europe-west1.run.app/panchang";
const TRANSITION_API="https://shastrapanchangam.com/api/v1/day";
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
    abhijit:d.muhurta?.abhijit_muhurtam||d.abhijitMuhurtham||d.abhijit||"—",
    gulikaKalam:d.muhurta?.gulika_kalam||d.gulikaKalam||"—",
    durmuhurtham:d.muhurta?.durmuhurtam||d.durmuhurtham||"—",
    varjyam:d.muhurta?.varjyam||d.varjyam||"—"
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
    abhijit:d.muhurta?.abhijit_muhurtam||d.abhijit||"—",
    gulikaKalam:d.muhurta?.gulika_kalam||d.gulikaKalam||"—",
    durmuhurtham:d.muhurta?.durmuhurtam||d.durmuhurtham||"—",
    varjyam:d.muhurta?.varjyam||d.varjyam||"—"
  };
}

async function fetchJson(url,options={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),7000);
  try{
    const r=await fetch(url,{...options,signal:controller.signal,headers:{Accept:"application/json",...(options.headers||{})}});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    return r.json();
  }finally{
    clearTimeout(timer);
  }
}

function formatWindow(w){
  if(!w)return "";
  const start=w.start||w.startLocal||w.from;
  const end=w.end||w.endLocal||w.to;
  if(!start&&!end)return "";
  return [start,end].filter(Boolean).join(" – ");
}

function formatWindows(value){
  if(!value)return "";
  if(Array.isArray(value))return value.map(formatWindow).filter(Boolean).join("; ");
  if(value.windows&&Array.isArray(value.windows))return value.windows.map(formatWindow).filter(Boolean).join("; ");
  return formatWindow(value)||String(value);
}

function previousIndiaDate(dateStr){
  const parts=dateStr.split("-").map(Number);
  const d=new Date(Date.UTC(parts[0],parts[1]-1,parts[2]-1));
  return d.toISOString().slice(0,10);
}
function transitionValue(value){
  if(value==null)return null;
  if(typeof value==="number")return {minutes:((Math.round(value)%1440)+1440)%1440,dayOffset:Math.floor(value/1440)};
  const s=String(value).trim();
  const iso=s.match(/(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  if(iso)return {date:iso[1],minutes:Number(iso[2])*60+Number(iso[3])};
  const tm=s.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if(tm){let h=Number(tm[1]),m=Number(tm[2]);if(tm[3]){const ap=tm[3].toLowerCase();if(ap==="pm"&&h<12)h+=12;if(ap==="am"&&h===12)h=0;}return {minutes:h*60+m};}
  return null;
}
function findTransition(obj,kind){
  let found=null;
  const walk=node=>{
    if(found||node==null)return;
    if(Array.isArray(node)){node.forEach(walk);return;}
    if(typeof node!=="object")return;
    for(const [k,v] of Object.entries(node)){
      const key=k.toLowerCase().replace(/[^a-z]/g,"");
      if(key.includes(kind)&&(key.includes("end")||key.includes("until")||key.includes("finish"))){
        const t=transitionValue(v);if(t){found=t;return;}
      }
      if(key===kind&&v&&typeof v==="object"){
        for(const [kk,vv] of Object.entries(v)){
          const kk2=kk.toLowerCase().replace(/[^a-z]/g,"");
          if(kk2.includes("end")||kk2.includes("until")||kk2.includes("finish")){const t=transitionValue(vv);if(t){found=t;return;}}
        }
      }
      walk(v);if(found)return;
    }
  };
  walk(obj);return found;
}
function transitionLabel(start,end){
  if(!end)return "";
  const fmt=t=>{
    if(!t)return "";
    let h=Math.floor(t.minutes/60),m=t.minutes%60;
    const ap=h>=12?"PM":"AM";h=h%12||12;
    return h+":"+String(m).padStart(2,"0")+" "+ap;
  };
  return start?fmt(start)+" – "+fmt(end):fmt(end);
}
function findElement(obj,kind){
  let found=null;
  const walk=node=>{
    if(found||node==null)return;
    if(Array.isArray(node)){node.forEach(walk);return;}
    if(typeof node!=="object")return;
    for(const [k,v] of Object.entries(node)){
      const key=k.toLowerCase().replace(/[^a-z]/g,"");
      if(key===kind&&v&&typeof v==="object"){
        let name=null,end=null;
        for(const [kk,vv] of Object.entries(v)){
          const kk2=kk.toLowerCase().replace(/[^a-z]/g,"");
          if(kk2==="name"||kk2==="fullname")name=String(vv);
          if(kk2.includes("end")||kk2.includes("until")||kk2.includes("finish"))end=transitionValue(vv);
        }
        if(name||end){found={name,end};return;}
      }
      walk(v);if(found)return;
    }
  };
  walk(obj);return found;
}
function sameElementName(a,b){
  if(!a||!b)return false;
  return String(a).toLowerCase().replace(/[^a-z0-9]/g,"")===String(b).toLowerCase().replace(/[^a-z0-9]/g,"");
}
async function fetchTransitionTimings(dateStr,city){
  if(!city?.slug)return {};
  try{
    const r=await fetch("/.netlify/functions/panchang-transition?date="+encodeURIComponent(dateStr)+"&city="+encodeURIComponent(city.slug),{headers:{Accept:"application/json"}});
    if(!r.ok)throw new Error("HTTP "+r.status);
    return await r.json();
  }catch(e){
    console.warn("Transition timing source unavailable",e);
    return {};
  }
}
