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

async function fetchJson(url){
  const r=await fetch(url,{headers:{Accept:"application/json"}});
  if(!r.ok)throw new Error(`HTTP ${r.status}`);
  return r.json();
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
async function fetchTransitionTimings(dateStr,city){
  if(!city?.slug)return {};
  try{
    const today=await fetchJson(TRANSITION_API+"/"+city.slug+"/"+dateStr+".json");
    const previous=await fetchJson(TRANSITION_API+"/"+city.slug+"/"+previousIndiaDate(dateStr)+".json");
    return {
      tithiTiming:transitionLabel(findTransition(previous,"tithi"),findTransition(today,"tithi")),
      nakshatraTiming:transitionLabel(findTransition(previous,"nakshatra"),findTransition(today,"nakshatra")),
      timingSource:"Shastra Panchangam"
    };
  }catch(e){console.warn("Transition timing source unavailable",e);return {};}
}

async function enrichCalendarIdentity(base,dateStr,c){
  try{
    const r=await fetch(ENRICH_API,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({date:dateStr,latitude:c.lat,longitude:c.lng,timezone:5.5,ayanamsa_mode:"LAHIRI"})});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const j=await r.json();
    const p=j?.panchang;
    if(!p)return base;
    const bad=p.inauspicious||{};
    return {...base,
      rashi:p.signs?.moon?.name||base.rashi,
      samvathsara:p.samvat?.samvatsara_name||base.samvathsara,
      masa:p.month?.amanta||base.masa,
      gulikaKalam:formatWindows(bad.gulika_kalam)||base.gulikaKalam,
      durmuhurtham:formatWindows(bad.durmuhurtam)||base.durmuhurtham,
      varjyam:formatWindows(bad.varjyam)||base.varjyam
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
    if(d?.date){const base=await enrichCalendarIdentity(normalizePrimary(d,c),dateStr,c);return {...base,...await fetchTransitionTimings(dateStr,c)};}
  }catch(e){
    console.warn("Primary Panchang source unavailable",e);
  }

  try{
    const q=new URLSearchParams({date:dateStr,city:c.slug||"hyderabad"});
    const d=await fetchJson(`${FALLBACK_API}?${q}`);
    if(d?.date){const base=await enrichCalendarIdentity(normalizeFallback(d,c),dateStr,c);return {...base,...await fetchTransitionTimings(dateStr,c)};}
  }catch(e){
    console.warn("Fallback Panchang source unavailable",e);
  }

  throw new Error("Unable to load Panchangam data right now. Please try again.");
}

const TELUGU_VALUES={
  vara:{Sunday:"ఆదివారం",Monday:"సోమవారం",Tuesday:"మంగళవారం",Wednesday:"బుధవారం",Thursday:"గురువారం",Friday:"శుక్రవారం",Saturday:"శనివారం"},
  rashi:{Aries:"మేషం",Taurus:"వృషభం",Gemini:"మిథునం",Cancer:"కర్కాటకం",Leo:"సింహం",Virgo:"కన్య",Libra:"తుల",Scorpio:"వృశ్చికం",Sagittarius:"ధనుస్సు",Capricorn:"మకరం",Aquarius:"కుంభం",Pisces:"మీనం",Mesha:"మేషం",Vrishabha:"వృషభం",Mithuna:"మిథునం",Karkataka:"కర్కాటకం",Simha:"సింహం",Kanya:"కన్య",Tula:"తుల",Vrischika:"వృశ్చికం",Dhanus:"ధనుస్సు",Makara:"మకరం",Kumbha:"కుంభం",Meena:"మీనం"},
  masa:{Chaitra:"చైత్రం",Vaishakha:"వైశాఖం",Jyeshtha:"జ్యేష్ఠం",Ashadha:"ఆషాఢం",Shravana:"శ్రావణం",Bhadrapada:"భాద్రపదం",Ashwin:"ఆశ్వయుజం",Ashvayuja:"ఆశ్వయుజం",Kartika:"కార్తీకం",Margashirsha:"మార్గశిరం",Pausha:"పుష్యం",Magha:"మాఘం",Phalguna:"ఫాల్గుణం"},
  nakshatra:{Ashwini:"అశ్విని",Bharani:"భరణి",Krittika:"కృత్తిక",Rohini:"రోహిణి",Mrigashira:"మృగశిర",Ardra:"ఆర్ద్ర",Punarvasu:"పునర్వసు",Pushya:"పుష్యమి",Ashlesha:"ఆశ్లేష",Magha:"మఘ",PurvaPhalguni:"పుబ్బ",UttaraPhalguni:"ఉత్తర ఫల్గుణి",Hasta:"హస్త",Chitra:"చిత్త",Swati:"స్వాతి",Vishakha:"విశాఖ",Anuradha:"అనూరాధ",Jyeshtha:"జ్యేష్ఠ",Mula:"మూల",PurvaAshadha:"పూర్వాషాఢ",UttaraAshadha:"ఉత్తరాషాఢ",Shravana:"శ్రవణం",Dhanishta:"ధనిష్ఠ",Shatabhisha:"శతభిషం",PurvaBhadrapada:"పూర్వాభాద్ర",UttaraBhadrapada:"ఉత్తరాభాద్ర",Revati:"రేవతి"},
  yoga:{Vishkambha:"విష్కంభ",Preeti:"ప్రీతి",Ayushman:"ఆయుష్మాన్",Saubhagya:"సౌభాగ్య",Shobhana:"శోభన",Atiganda:"అతిగండ",Sukarma:"సుకర్మ",Dhriti:"ధృతి",Shula:"శూల",Ganda:"గండ",Vriddhi:"వృద్ధి",Dhruva:"ధ్రువ",Vyaghata:"వ్యాఘాత",Harshana:"హర్షణ",Vajra:"వజ్ర",Siddhi:"సిద్ధి",Vyatipata:"వ్యతి పాత",Variyana:"వరీయాన్",Parigha:"పరిఘ",Shiva:"శివ",Siddha:"సిద్ధ",Sadhya:"సాధ్య",Shubha:"శుభ",Shukla:"శుక్ల",Brahma:"బ్రహ్మ",Indra:"ఇంద్ర",Vaidhriti:"వైధృతి"},
  karana:{Bava:"బవ",Balava:"బాలవ",Kaulava:"కౌలవ",Taitila:"తైతిల",Garaja:"గరజ",Vanija:"వణిజ",Vishti:"విష్టి",Shakuni:"శకుని",Chatushpada:"చతుష్పాద",Naga:"నాగ",Kimstughna:"కింస్తుఘ్న"},
  samvathsara:{Prabhava:"ప్రభవ",Vibhava:"విభవ",Shukla:"శుక్ల",Pramodoota:"ప్రమోదూత",Prajothpatti:"ప్రజోత్పత్తి",Angirasa:"ఆంగీరస",Shrimukha:"శ్రీముఖ",Bhava:"భావ",Yuva:"యువ",Dhata:"ధాత",Ishvara:"ఈశ్వర",Bahudhanya:"బహుధాన్య",Pramathi:"ప్రమాథి",Vikrama:"విక్రమ",Vrisha:"వృష",Chitrabhanu:"చిత్రభాను",Subhanu:"సుభాను",Tarana:"తారణ",Parthiva:"పార్థివ",Vyaya:"వ్యయ",Sarvajit:"సర్వజిత్",Sarvadhari:"సర్వధారి",Virodhi:"విరోధి",Vikriti:"వికృతి",Khara:"ఖర",Nandana:"నందన",Vijaya:"విజయ",Jaya:"జయ",Manmatha:"మన్మథ",Durmukhi:"దుర్ముఖి",Hevilambi:"హేవిళంబి",Vilambi:"విళంబి",Vikari:"వికారి",Sharvari:"శార్వరి",Plava:"ప్లవ",Shubhakrit:"శుభకృత్",Shobhana:"శోభకృత్",Krodhi:"క్రోధి",Vishvavasu:"విశ్వావసు",Parabhava:"పరాభవ",Plavanga:"ప్లవంగ",Kilaka:"కీలక",Saumya:"సౌమ్య",Sadharana:"సాధారణ",Virodhikrit:"విరోధికృత్",Paridhavi:"పరిధావి",Pramadeecha:"ప్రమాదీచ",Ananda:"ఆనంద",Rakshasa:"రాక్షస",Nala:"నల",Pingala:"పింగళ",Kalayukta:"కాళయుక్తి",Siddharthi:"సిద్ధార్థి",Raudra:"రౌద్ర",Durmati:"దుర్మతి",Dundubhi:"దుందుభి",Rudhirodgari:"రుధిరోద్గారి",Raktakshi:"రక్తాక్షి",Krodhana:"క్రోధన",Akshaya:"అక్షయ"}
};
const TELUGU_TITHI={Pratipada:"పాడ్యమి",Dvitiiya:"విదియ",Dvitiya:"విదియ",Tritiya:"తదియ",Chaturthi:"చవితి",Panchami:"పంచమి",Shashthi:"షష్ఠి",Saptami:"సప్తమి",Ashtami:"అష్టమి",Navami:"నవమి",Dashami:"దశమి",Ekadashi:"ఏకాదశి",Dwadashi:"ద్వాదశి",Trayodashi:"త్రయోదశి",Chaturdashi:"చతుర్దశి",Purnima:"పౌర్ణమి",Amavasya:"అమావాస్య"};
function translatePanchangValue(type,value){
  if(value==null)return value;
  const raw=String(value).trim();
  if(!raw||raw==="—"||raw==="Not provided")return raw;
  const lang=window.SiddhaApp?.getLanguage?.()||"en";
  if(lang!=="te")return raw;
  const map=TELUGU_VALUES[type]||{};
  if(map[raw])return map[raw];
  if(type==="thithi"){
    const m=raw.match(/^(Shukla|Krishna)\s+(.+)$/i);
    if(m){
      const phase=m[1].toLowerCase()==="shukla"?"శుక్ల":"కృష్ణ";
      const name=TELUGU_TITHI[m[2]]||m[2];
      return phase+" "+name;
    }
    return TELUGU_TITHI[raw]||raw;
  }
  return raw;
}

window.SiddhaPanchangam={
  fetchPanchangam,
  formatPanchangam:d=>d,
  indiaToday,
  cityConfig,
  cities:CITIES,
  translateValue:translatePanchangValue,
  formatTransition:transitionLabel
};