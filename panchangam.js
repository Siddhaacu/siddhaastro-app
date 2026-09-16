/* Siddha Astro Panchangam data helper */
const PANCHANGAM_API = 'https://nityapanchangam.com/api/panchangam.php';

const BILINGUAL = {
  vara: { sunday:['ఆదివారం','Sunday'], monday:['సోమవారం','Monday'], tuesday:['మంగళవారం','Tuesday'], wednesday:['బుధవారం','Wednesday'], thursday:['గురువారం','Thursday'], friday:['శుక్రవారం','Friday'], saturday:['శనివారం','Saturday'] },
  tithi: { pratipada:['పాడ్యమి','Pratipada'], dwitiya:['విదియ','Dwitiya'], tritiya:['తదియ','Tritiya'], chaturthi:['చవితి','Chaturthi'], panchami:['పంచమి','Panchami'], shashthi:['షష్ఠి','Shashthi'], saptami:['సప్తమి','Saptami'], ashtami:['అష్టమి','Ashtami'], navami:['నవమి','Navami'], dashami:['దశమి','Dashami'], ekadashi:['ఏకాదశి','Ekadashi'], dwadashi:['ద్వాదశి','Dwadashi'], trayodashi:['త్రయోదశి','Trayodashi'], chaturdashi:['చతుర్దశి','Chaturdashi'], purnima:['పౌర్ణమి','Purnima'], amavasya:['అమావాస్య','Amavasya'] },
  nakshatra: { ashwini:['అశ్విని','Ashwini'], bharani:['భరణి','Bharani'], krittika:['కృత్తిక','Krittika'], rohini:['రోహిణి','Rohini'], mrigashira:['మృగశిర','Mrigashira'], ardra:['ఆర్ద్ర','Ardra'], punarvasu:['పునర్వసు','Punarvasu'], pushya:['పుష్యమి','Pushya'], ashlesha:['ఆశ్లేష','Ashlesha'], magha:['మఘ','Magha'], purva phalguni:['పుబ్బ','Purva Phalguni'], uttara phalguni:['ఉత్తర','Uttara Phalguni'], hasta:['హస్త','Hasta'], chitra:['చిత్త','Chitra'], swati:['స్వాతి','Swati'], vishakha:['విశాఖ','Vishakha'], anuradha:['అనూరాధ','Anuradha'], jyeshtha:['జ్యేష్ఠ','Jyeshtha'], mula:['మూల','Mula'], purva ashadha:['పూర్వాషాఢ','Purva Ashadha'], uttara ashadha:['ఉత్తరాషాఢ','Uttara Ashadha'], shravana:['శ్రవణం','Shravana'], dhanishtha:['ధనిష్ఠ','Dhanishtha'], shatabhisha:['శతభిషం','Shatabhisha'], purva bhadrapada:['పూర్వాభాద్ర','Purva Bhadrapada'], uttara bhadrapada:['ఉత్తరాభాద్ర','Uttara Bhadrapada'], revati:['రేవతి','Revati'] },
  rashi: { mesha:['మేష రాశి','Mesha Rashi'], vrishabha:['వృషభ రాశి','Vrishabha Rashi'], mithuna:['మిథున రాశి','Mithuna Rashi'], karkataka:['కర్కాటక రాశి','Karkataka Rashi'], simha:['సింహ రాశి','Simha Rashi'], kanya:['కన్యా రాశి','Kanya Rashi'], tula:['తులా రాశి','Tula Rashi'], vrischika:['వృశ్చిక రాశి','Vrishchika Rashi'], dhanu:['ధనుస్సు రాశి','Dhanu Rashi'], makara:['మకర రాశి','Makara Rashi'], kumbha:['కుంభ రాశి','Kumbha Rashi'], meena:['మీన రాశి','Meena Rashi'] }
};

function key(value){return String(value||'').toLowerCase().replace(/[^a-z ]/g,'').trim();}
function bilingual(value, group){const raw=String(value||'—');const k=key(raw);const found=Object.entries(BILINGUAL[group]||{}).find(([name])=>k.includes(name));return found?`${found[1][0]} • ${found[1][1]}`:raw;}
function formatMasa(data){const raw=data?.masa?.name||data?.masa?.english||data?.lunar_month||data?.masa_name||'';return raw||'మాసం సమాచారం లేదు • Masa unavailable';}
function formatPanchangam(data){return {
 vara:bilingual(data?.vara?.name||data?.vara,'vara'),
 thithi:bilingual(data?.tithi?.name||data?.tithi,'tithi'),
 nakshatra:bilingual(data?.nakshatra?.name||data?.nakshatra,'nakshatra'),
 rashi:bilingual(data?.rashi?.name||data?.rashi?.name_en||data?.moon_sign||data?.chandra_rashi,'rashi'),
 samvathsara:data?.samvatsara?.name||data?.samvathsara?.name||data?.samvatsara||data?.samvathsara||'సంవత్సరం సమాచారం లేదు • Samvatsara unavailable',
 yoga:data?.yoga?.name||data?.yoga||'—',karana:data?.karana?.name||data?.karana||'—',masa:formatMasa(data),
 sunrise:data?.sun?.sunrise||data?.sunrise||'—',sunset:data?.sun?.sunset||data?.sunset||'—',rahuKalam:data?.muhurta?.rahu_kalam||data?.rahu_kalam||'—',yamagandam:data?.muhurta?.yamagandam||data?.yamagandam||'—',abhijit:data?.muhurta?.abhijit_muhurtam||data?.abhijit_muhurtam||'—'
};}
async function fetchPanchangam(date=new Date()){const isoDate=date instanceof Date?date.toISOString().slice(0,10):date;const response=await fetch(`${PANCHANGAM_API}?date=${encodeURIComponent(isoDate)}&city=hyderabad`,{cache:'no-store'});if(!response.ok)throw new Error(`Panchangam request failed: ${response.status}`);return response.json();}
window.SiddhaPanchangam={fetchPanchangam,formatPanchangam};