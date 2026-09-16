/* Siddha Astro Panchangam data helper */
const PANCHANGAM_API = 'https://nityapanchangam.com/api/panchangam.php';

const BILINGUAL = {
  vara:{sunday:['ఆదివారం','Sunday'],monday:['సోమవారం','Monday'],tuesday:['మంగళవారం','Tuesday'],wednesday:['బుధవారం','Wednesday'],thursday:['గురువారం','Thursday'],friday:['శుక్రవారం','Friday'],saturday:['శనివారం','Saturday']},
  tithi:{pratipada:['పాడ్యమి','Pratipada'],dwitiya:['విదియ','Dwitiya'],tritiya:['తదియ','Tritiya'],chaturthi:['చవితి','Chaturthi'],panchami:['పంచమి','Panchami'],shashthi:['షష్ఠి','Shashthi'],saptami:['సప్తమి','Saptami'],ashtami:['అష్టమి','Ashtami'],navami:['నవమి','Navami'],dashami:['దశమి','Dashami'],ekadashi:['ఏకాదశి','Ekadashi'],dwadashi:['ద్వాదశి','Dwadashi'],trayodashi:['త్రయోదశి','Trayodashi'],chaturdashi:['చతుర్దశి','Chaturdashi'],purnima:['పౌర్ణమి','Purnima'],amavasya:['అమావాస్య','Amavasya']},
  nakshatra:{ashwini:['అశ్విని','Ashwini'],bharani:['భరణి','Bharani'],krittika:['కృత్తిక','Krittika'],rohini:['రోహిణి','Rohini'],mrigashira:['మృగశిర','Mrigashira'],ardra:['ఆర్ద్ర','Ardra'],punarvasu:['పునర్వసు','Punarvasu'],pushya:['పుష్యమి','Pushya'],ashlesha:['ఆశ్లేష','Ashlesha'],magha:['మఘ','Magha'],'purva phalguni':['పుబ్బ','Purva Phalguni'],'uttara phalguni':['ఉత్తర','Uttara Phalguni'],hasta:['హస్త','Hasta'],chitra:['చిత్త','Chitra'],swati:['స్వాతి','Swati'],vishakha:['విశాఖ','Vishakha'],anuradha:['అనూరాధ','Anuradha'],jyeshtha:['జ్యేష్ఠ','Jyeshtha'],mula:['మూల','Mula'],'purva ashadha':['పూర్వాషాఢ','Purva Ashadha'],'uttara ashadha':['ఉత్తరాషాఢ','Uttara Ashadha'],shravana:['శ్రవణం','Shravana'],dhanishtha:['ధనిష్ఠ','Dhanishtha'],shatabhisha:['శతభిషం','Shatabhisha'],'purva bhadrapada':['పూర్వాభాద్ర','Purva Bhadrapada'],'uttara bhadrapada':['ఉత్తరాభాద్ర','Uttara Bhadrapada'],revati:['రేవతి','Revati']},
  rashi:{mesha:['మేష రాశి','Mesha Rashi'],vrishabha:['వృషభ రాశి','Vrishabha Rashi'],mithuna:['మిథున రాశి','Mithuna Rashi'],karkataka:['కర్కాటక రాశి','Karkataka Rashi'],simha:['సింహ రాశి','Simha Rashi'],kanya:['కన్యా రాశి','Kanya Rashi'],tula:['తులా రాశి','Tula Rashi'],vrischika:['వృశ్చిక రాశి','Vrishchika Rashi'],dhanu:['ధనుస్సు రాశి','Dhanu Rashi'],makara:['మకర రాశి','Makara Rashi'],kumbha:['కుంభ రాశి','Kumbha Rashi'],meena:['మీన రాశి','Meena Rashi']}
};

function key(value){return String(value??'').toLowerCase().replace(/[^a-z ]/g,'').replace(/\s+/g,' ').trim();}
function pick(obj,...paths){for(const path of paths){let value=obj;for(const part of path.split('.'))value=value?.[part];if(value!==undefined&&value!==null&&value!=='')return value;}return '';}
function bilingual(value,group){const raw=String(value||'—');const normalized=key(raw);const found=Object.entries(BILINGUAL[group]||{}).find(([name])=>normalized.includes(name));return found?`${found[1][0]} • ${found[1][1]}`:raw;}
function formatMasa(data){return String(pick(data,'masa.name','masa.english','lunar_month','masa_name')||'మాసం సమాచారం లేదు • Masa unavailable');}
function formatPanchangam(raw){const data=raw?.data||raw?.result||raw?.panchangam||raw||{};return {
 vara:bilingual(pick(data,'vara.name','vara.teluguName','vara'),'vara'),
 thithi:bilingual(pick(data,'tithi.name','tithi.teluguName','tithi','thithi.name','thithi'),'tithi'),
 nakshatra:bilingual(pick(data,'nakshatra.name','nakshatra.teluguName','nakshatra'),'nakshatra'),
 rashi:bilingual(pick(data,'rashi.name','rashi.teluguName','rashi','moon_sign','chandra_rashi'),'rashi'),
 samvathsara:pick(data,'samvatsara.name','samvathsara.name','samvatsara','samvathsara')||'సంవత్సరం సమాచారం లేదు • Samvatsara unavailable',
 yoga:pick(data,'yoga.name','yoga.teluguName','yoga')||'—',karana:pick(data,'karana.name','karana.teluguName','karana')||'—',masa:formatMasa(data),
 sunrise:pick(data,'sun.sunrise','sunrise','astronomical.sunrise.local')||'—',sunset:pick(data,'sun.sunset','sunset','astronomical.sunset.local')||'—',
 rahuKalam:pick(data,'muhurta.rahu_kalam','rahu_kalam','rahuKalam')||'—',yamagandam:pick(data,'muhurta.yamagandam','yamagandam')||'—',abhijit:pick(data,'muhurta.abhijit_muhurtam','abhijit_muhurtam','abhijit')||'—'
};}
async function fetchPanchangam(date=new Date()){
 const isoDate=date instanceof Date?date.toISOString().slice(0,10):date;
 const urls=[`${PANCHANGAM_API}?date=${encodeURIComponent(isoDate)}&city=Hyderabad`,`${PANCHANGAM_API}?date=${encodeURIComponent(isoDate)}&city=hyderabad`];
 let lastError;
 for(const url of urls){try{const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);const json=await response.json();if(json?.error)throw new Error(json.error);return json;}catch(error){lastError=error;}}
 throw new Error(`Panchangam API unavailable: ${lastError?.message||'request failed'}`);
}
window.SiddhaPanchangam={fetchPanchangam,formatPanchangam};