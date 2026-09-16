/* Siddha Astro Panchangam data helper */
const PANCHANGAM_API = 'https://www.shubh.live/api/v1/panchang';

const TELUGU = {
  mesha:['మేష రాశి','Mesha Rashi'],vrishabha:['వృషభ రాశి','Vrishabha Rashi'],mithuna:['మిథున రాశి','Mithuna Rashi'],karkataka:['కర్కాటక రాశి','Karkataka Rashi'],simha:['సింహ రాశి','Simha Rashi'],kanya:['కన్యా రాశి','Kanya Rashi'],tula:['తులా రాశి','Tula Rashi'],vrischika:['వృశ్చిక రాశి','Vrishchika Rashi'],dhanu:['ధనుస్సు రాశి','Dhanu Rashi'],makara:['మకర రాశి','Makara Rashi'],kumbha:['కుంభ రాశి','Kumbha Rashi'],meena:['మీన రాశి','Meena Rashi']
};
function pick(obj,...paths){for(const path of paths){let v=obj;for(const p of path.split('.'))v=v?.[p];if(v!==undefined&&v!==null&&v!=='')return v;}return '';}
function text(v){return typeof v==='object'&&v?v.teluguName||v.te||v.name||v.en||v.sa||'':String(v||'');}
function rashi(v){const raw=text(v),k=raw.toLowerCase().replace(/[^a-z]/g,'');const found=Object.entries(TELUGU).find(([n])=>k.includes(n));return found?`${found[1][0]} • ${found[1][1]}`:raw||'రాశి సమాచారం లేదు • Rashi unavailable';}
function formatPanchangam(raw){const d=raw?.data||raw?.result||raw?.panchangam||raw||{};return {
 vara:text(pick(d,'vara','weekday'))||'—',
 thithi:text(pick(d,'tithi','thithi'))||'—',
 nakshatra:text(pick(d,'nakshatra'))||'—',
 rashi:rashi(pick(d,'moonRashi','rashi','chandraRashi','moon_sign')),
 samvathsara:text(pick(d,'samvat.samvatsara','samvatsara','samvathsara','samvat'))||'సంవత్సరం సమాచారం లేదు • Samvatsara unavailable',
 masa:text(pick(d,'lunarMonth.amanta','lunarMonth','masa','lunar_month','masa_name'))||'మాసం సమాచారం లేదు • Masa unavailable',
 yoga:text(pick(d,'yoga'))||'—',karana:text(pick(d,'karana'))||'—',
 sunrise:text(pick(d,'sunrise','astronomical.sunrise','sun.sunrise'))||'—',sunset:text(pick(d,'sunset','astronomical.sunset','sun.sunset'))||'—',
 rahuKalam:text(pick(d,'rahuKalam','muhurta.rahu_kalam','rahu_kalam'))||'—',yamagandam:text(pick(d,'yamagandam','muhurta.yamagandam'))||'—',abhijit:text(pick(d,'abhijit','abhijitMuhurtham','muhurta.abhijit_muhurtam'))||'—'
};}
async function fetchPanchangam(date=new Date()){
 const iso=date instanceof Date?date.toISOString().slice(0,10):date;
 const url=`${PANCHANGAM_API}?lat=17.385&lon=78.4867&date=${encodeURIComponent(iso)}`;
 const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);const json=await response.json();if(json?.error||json?.success===false)throw new Error(json.error||'API error');return json;
}
window.SiddhaPanchangam={fetchPanchangam,formatPanchangam};