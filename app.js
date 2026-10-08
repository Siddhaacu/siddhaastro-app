(()=>{const r=document.documentElement;let theme=localStorage.getItem("siddha-theme")||"light";if(theme==="dark")r.classList.add("dark");let s=Number(localStorage.getItem("siddha-scale")||1);let lang=localStorage.getItem("siddha-language")||"en";
const dict={"Home":"హోమ్","Panchangam":"పంచాంగం","Horoscope":"రాశిఫలం","Kundali":"కుండలి","More":"మరిన్ని","Siddha Astro":"సిద్ధ ఆస్ట్రో","Vedic wisdom, simply presented":"వేద జ్ఞానం — సులభంగా","Daily Vedic overview":"దైనందిన వేద అవలోకనం","Daily Vedic calendar":"దైనందిన వేద క్యాలెండర్","Rashi guidance":"రాశి మార్గదర్శకం","Birth chart":"జన్మ కుండలి","Siddha Astro tools":"సిద్ధ ఆస్ట్రో సాధనాలు","Dynamic Panchangam":"డైనమిక్ పంచాంగం","Accurate daily Panchangam for the selected date and city.":"ఎంచుకున్న తేదీ మరియు నగరానికి ఖచ్చితమైన దైనందిన పంచాంగం.","Your daily connection with Vedic wisdom.":"వేద జ్ఞానంతో మీ దైనందిన అనుబంధం.","Today's Panchangam":"ఈ రోజు పంచాంగం","View full":"పూర్తిగా చూడండి","Today's Panchangam is loaded dynamically using the same Panchangam engine as the full page.":"ఈ రోజు పంచాంగం పూర్తి పేజీలో ఉపయోగించే అదే పంచాంగ ఇంజిన్ ద్వారా డైనమిక్‌గా లోడ్ అవుతుంది.","Complete daily calendar and timings.":"పూర్తి దైనందిన క్యాలెండర్ మరియు సమయాలు.","Generate a birth-chart overview.":"జన్మ కుండలి అవలోకనం చూడండి.","Read today's rashi guidance.":"ఈ రోజు రాశి మార్గదర్శకాన్ని చదవండి.","Daily devotional reading":"దైనందిన భక్తి పఠనం","A new sloka is selected automatically every day using India time.":"భారత కాలమానం ప్రకారం ప్రతిరోజూ కొత్త శ్లోకం స్వయంచాలకంగా ఎంపిక అవుతుంది.","Core Siddha Astro tools.":"సిద్ధ ఆస్ట్రో ప్రధాన సాధనాలు.","Daily overview.":"దైనందిన అవలోకనం.","Vedic calendar.":"వేద క్యాలెండర్.","Select your rashi.":"మీ రాశిని ఎంచుకోండి.","Choose a rashi.":"రాశిని ఎంచుకోండి.","Daily guidance":"దైనందిన మార్గదర్శకం","Date":"తేదీ","City":"నగరం","Load Panchangam":"పంచాంగం లోడ్ చేయండి","Today":"ఈ రోజు","Loading Panchangam…":"పంచాంగం లోడ్ అవుతోంది…","Panchangam updated successfully.":"పంచాంగం విజయవంతంగా నవీకరించబడింది.","Vara":"వారం","Tithi":"తిథి","Nakshatra":"నక్షత్రం","Rashi":"రాశి","Samvathsara":"సంవత్సరం","Masa":"మాసం","Yoga":"యోగం","Karana":"కరణం","Sunrise":"సూర్యోదయం","Sunset":"సూర్యాస్తమయం","Rahu Kalam":"రాహుకాలం","Yamagandam":"యమగండం","Abhijit Muhurtham":"అభిజిత్ ముహూర్తం","Gulika Kalam":"గుళిక కాలం","Durmuhurtham":"దుర్ముహూర్తం","Varjyam":"వర్జ్యం","Enter your birth details for a chart overview.":"మీ జన్మ వివరాలను నమోదు చేసి కుండలి రూపొందించండి.","Birth date":"జన్మ తేదీ","Birth time":"జన్మ సమయం","Birth city":"జన్మ నగరం","Generate Kundali":"కుండలి రూపొందించండి","Enter your details and generate your Kundali.":"మీ వివరాలను నమోదు చేసి కుండలిని రూపొందించండి.","Please enter birth date and time.":"దయచేసి జన్మ తేదీ మరియు సమయాన్ని నమోదు చేయండి.","Chart overview":"కుండలి అవలోకనం","Planets":"గ్రహాలు","Insights":"సూచనలు","Today":"ఈ రోజు","Career":"వృత్తి","Love":"ప్రేమ","Health":"ఆరోగ్యం"};
Object.assign(dict,{
  "Daily Horoscope":"దైనందిన రాశిఫలం","Rashi guidance":"రాశి మార్గదర్శకం","Select your rashi.":"మీ రాశిని ఎంచుకోండి.","Choose a rashi.":"రాశిని ఎంచుకోండి.","Today":"ఈ రోజు","Career":"వృత్తి","Love":"ప్రేమ","Health":"ఆరోగ్యం","Today's Panchang influence:":"ఈ రోజు పంచాంగ ప్రభావం:","Moon Rashi":"చంద్ర రాశి","Daily guidance":"దైనందిన మార్గదర్శకం",
  "Janma Kundali":"జన్మ కుండలి","Lahiri sidereal • Whole-sign houses":"లాహిరి సైడీరియల్ • సంపూర్ణ రాశి గృహాలు","Calculated":"లెక్కించబడింది","Lagna":"లగ్నం","Moon Rashi":"చంద్ర రాశి","Nakshatra Pada":"నక్షత్ర పాదం","Rasi Chart (D1)":"రాశి చార్ట్ (D1)","South Indian style":"దక్షిణ భారత శైలి","Planetary Positions":"గ్రహ స్థితులు","Sign, degree, house and Nakshatra":"రాశి, డిగ్రీ, భావం మరియు నక్షత్రం","Planet":"గ్రహం","Sign":"రాశి","Degree":"డిగ్రీ","House":"భావం","Status":"స్థితి","Retrograde":"వక్రగతి","Direct":"మార్గి","Current Mahadasha":"ప్రస్తుత మహాదశ","Current Antardasha":"ప్రస్తుత అంతర్దశ","Calculation:":"లెక్కింపు:","Download Kundali PDF":"కుండలి PDF డౌన్‌లోడ్ చేయండి","Accurate Vedic chart":"ఖచ్చితమైన వేద చార్ట్","Generate a Lahiri sidereal birth chart with Lagna, planetary positions and the current Vimshottari Mahadasha & Antardasha.":"లాహిరి సైడీరియల్ జన్మ చార్ట్‌లో లగ్నం, గ్రహ స్థితులు మరియు ప్రస్తుత విమ్షోత్తరి మహాదశ & అంతర్దశను చూడండి.","Premium Consultation":"ప్రీమియం సంప్రదింపు","For premium consultation contact":"ప్రీమియం సంప్రదింపుల కోసం సంప్రదించండి","Settings":"సెట్టింగ్స్","Default Language":"డిఫాల్ట్ భాష","Default Theme":"డిఫాల్ట్ థీమ్","Default City":"డిఫాల్ట్ నగరం","Settings are stored locally on this device.":"సెట్టింగ్స్ ఈ పరికరంలో స్థానికంగా సేవ్ చేయబడతాయి.","Settings saved.":"సెట్టింగ్స్ సేవ్ చేయబడ్డాయి.","Daily Panchangam Notifications":"దైనందిన పంచాంగ నోటిఫికేషన్లు","Enable notifications":"నోటిఫికేషన్లు ప్రారంభించండి","Notifications enabled":"నోటిఫికేషన్లు ప్రారంభించబడ్డాయి","Publications":"ప్రచురణలు","Vedic Scriptures":"వేద గ్రంథాలు"
});Object.assign(dict,{"Monthly Panchangam":"మాస పంచాంగం","Tithi-based observances and festivals":"తిథి ఆధారిత వ్రతాలు మరియు పండుగలు","Previous month":"గత నెల","Current month":"ప్రస్తుత నెల","Next month":"తదుపరి నెల","🌑 Amavasya":"🌑 అమావాస్య","🌕 Pournami":"🌕 పౌర్ణమి","🪔 Ekadashi":"🪔 ఏకాదశి","🐘 Sankashti Chaturthi":"🐘 సంకష్ట హర చవితి","🔱 Festival / Vrat":"🔱 పండుగ / వ్రతం","Calendar calculations:":"క్యాలెండర్ లెక్కలు:","local city sunrise":"స్థానిక నగర సూర్యోదయం", "Tarabalam & Chandrabalam":"తారాబలం & చంద్రబలం","Personal daily strength":"దైనందిన వ్యక్తిగత బలం","Personal Muhurta Guide":"వ్యక్తిగత ముహూర్త మార్గదర్శకం","Check your personal Tara Bala and Chandra Bala for the selected date and city.":"ఎంచుకున్న తేదీ మరియు నగరానికి మీ తారాబలం మరియు చంద్రబలాన్ని చూడండి.","Janma Nakshatra":"జన్మ నక్షత్రం","Janma Rashi":"జన్మ రాశి","Calculate":"లెక్కించండి","Loading current Moon position…":"ప్రస్తుత చంద్ర స్థితి లోడ్ అవుతోంది…","Analysis completed.":"విశ్లేషణ పూర్తైంది.","How it is calculated":"ఎలా లెక్కించబడుతుంది","Traditional Navatara and Moon-sign counting.":"సాంప్రదాయ నవతార మరియు చంద్ర రాశి లెక్కింపు.","Tarabalam":"తారాబలం","Chandrabalam":"చంద్రబలం","Today's Nakshatra":"ఈ రోజు నక్షత్రం","Today's Moon Rashi":"ఈ రోజు చంద్ర రాశి","Tara number":"తారా సంఖ్య","Position from Janma Rashi":"జన్మ రాశి నుండి స్థానం","Favourable":"అనుకూలం","Caution":"జాగ్రత్త","Avoid":"వర్జించాలి","Mixed":"మిశ్రమం","Select Janma Nakshatra":"జన్మ నక్షత్రాన్ని ఎంచుకోండి","Select Janma Rashi":"జన్మ రాశిని ఎంచుకోండి","Enter your Janma Nakshatra and Janma Rashi to calculate.":"లెక్కించడానికి మీ జన్మ నక్షత్రం మరియు జన్మ రాశిని ఎంచుకోండి."});Object.assign(dict,{
  "Daily Guidance":"దైనందిన మార్గదర్శకం","Daily Rashi guidance":"దైనందిన రాశి మార్గదర్శకం","Horoscope":"రాశిఫలం",
  "More":"మరిన్ని","Core Siddha Astro tools.":"సిద్ధ ఆస్ట్రో ప్రధాన సాధనాలు.","Settings":"సెట్టింగ్స్",
  "Your Siddha Astro preferences are saved on this device and reused across the app.":"మీ సిద్ధ ఆస్ట్రో ప్రాధాన్యతలు ఈ పరికరంలో భద్రపరచబడి యాప్ అంతటా ఉపయోగించబడతాయి.",
  "Default Theme":"డిఫాల్ట్ థీమ్","Light":"లైట్","Dark":"డార్క్","Default City":"డిఫాల్ట్ నగరం",
  "Janma Nakshatra":"జన్మ నక్షత్రం","Janma Rashi":"జన్మ రాశి","Select Janma Nakshatra":"జన్మ నక్షత్రాన్ని ఎంచుకోండి","Select Janma Rashi":"జన్మ రాశిని ఎంచుకోండి",
  "Daily Panchangam Notifications":"దైనందిన పంచాంగ నోటిఫికేషన్లు","Enable notifications":"నోటిఫికేషన్లు ప్రారంభించండి",
  "Home":"హోమ్","Panchangam":"పంచాంగం","Kundali":"కుండలి",
  "Daily Vedic calendar":"దైనందిన వేద క్యాలెండర్","Rashi guidance":"రాశి మార్గదర్శకం","Birth chart":"జన్మ చార్ట్",
  "Dynamic Panchangam":"డైనమిక్ పంచాంగం","Panchangam":"పంచాంగం","Accurate daily Panchangam for the selected date and city.":"ఎంచుకున్న తేదీ మరియు నగరానికి ఖచ్చితమైన దైనందిన పంచాంగం.",
  "Load Panchangam":"పంచాంగం లోడ్ చేయండి","Today":"ఈ రోజు","Panchangam updated successfully.":"పంచాంగం విజయవంతంగా నవీకరించబడింది.",
  "Daily overview.":"దైనందిన అవలోకనం.","Vedic calendar.":"వేద క్యాలెండర్.","Birth chart":"జన్మ చార్ట్","Rashi guidance":"రాశి మార్గదర్శకం",
  "Publications":"ప్రచురణలు","Vedic Scriptures":"వేద గ్రంథాలు","All Books":"అన్ని పుస్తకాలు","Pooja & Vrata Books":"పూజ & వ్రత పుస్తకాలు",
  "Daily devotional reading":"దైనందిన భక్తి పఠనం","View full":"పూర్తిగా చూడండి",
  "Your daily connection with Vedic wisdom.":"వేద జ్ఞానంతో మీ దైనందిన అనుబంధం.",
  "Date":"తేదీ","City":"నగరం","Sunrise":"సూర్యోదయం","Sunset":"సూర్యాస్తమయం","Rahu Kalam":"రాహుకాలం","Yamagandam":"యమగండం",
  "Yoga":"యోగం","Karana":"కరణం","Nakshatra":"నక్షత్రం","Rashi":"రాశి","Tithi":"తిథి","Vara":"వారం",
  "Career":"వృత్తి","Love":"ప్రేమ","Health":"ఆరోగ్యం","Panchang":"పంచాంగం","Moon Rashi":"చంద్ర రాశి",
  "Decrease font size":"అక్షర పరిమాణం తగ్గించండి","Increase font size":"అక్షర పరిమాణం పెంచండి",
  "Dark theme":"డార్క్ థీమ్","Light theme":"లైట్ థీమ్"
});const reverse={};Object.keys(dict).forEach(k=>reverse[dict[k]]=k);
function translateNode(n){
  if(n.nodeType!==3)return;
  const raw=n.nodeValue,trim=raw.trim();
  if(!trim)return;
  const target=lang==="te"?dict[trim]:reverse[trim];
  if(target)n.nodeValue=raw.replace(trim,target);
}
let translating=false;let languageObserver=null;
function applyLanguage(){
  if(translating)return;
  translating=true;
  if(languageObserver)languageObserver.disconnect();
  document.documentElement.lang=lang==="te"?"te":"en";
  document.querySelectorAll("[data-control-lang]").forEach(b=>{
    b.textContent=lang==="en"?"తెలుగు":"English";
    b.setAttribute("aria-label",lang==="en"?"Switch to Telugu":"Switch to English");
  });
  document.querySelectorAll("[data-theme-toggle]").forEach(b=>{
    b.textContent=theme==="dark"?"☀":"☾";
    b.setAttribute("aria-label",theme==="dark"?"Switch to light theme":"Switch to dark theme");
    b.title=theme==="dark"?"Light theme":"Dark theme";
  });
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let n;while(n=w.nextNode())translateNode(n);
  translating=false;
  if(languageObserver)languageObserver.observe(document.body,{childList:true,subtree:true});
}
function sync(){r.style.setProperty("--scale",s);document.querySelectorAll("[data-font-size]").forEach(e=>e.textContent=Math.round(s*100)+"%");applyLanguage();}
function renderControls(){
  let controls=document.querySelector(".global-controls");
  if(!controls){
    controls=document.createElement("div");
    controls.className="controls global-controls";
    const header=document.querySelector(".header");
    if(header)header.insertAdjacentElement("afterend",controls);
    else (document.querySelector(".app")||document.body).prepend(controls);
  }
  controls.innerHTML='<button class="lang-btn" type="button" data-control-lang>తెలుగు</button><button class="font-btn" type="button" data-font="down" aria-label="Decrease font size" title="Decrease font size">A−</button><span class="font-size" data-font-size>100%</span><button class="font-btn" type="button" data-font="up" aria-label="Increase font size" title="Increase font size">A+</button><button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark theme" title="Dark theme">☾</button>';
  controls.querySelector("[data-control-lang]").onclick=()=>setLanguage(lang==="en"?"te":"en");
  controls.querySelector("[data-font=down]").onclick=()=>changeFont(-.04);
  controls.querySelector("[data-font=up]").onclick=()=>changeFont(.04);
  controls.querySelector("[data-theme-toggle]").onclick=toggleTheme;
}
function setLanguage(v){
  lang=v==="te"?"te":"en";
  localStorage.setItem("siddha-language",lang);
  renderNav();renderControls();applyLanguage();
  document.dispatchEvent(new CustomEvent("languagechange"));
}
function toggleTheme(){
  theme=r.classList.toggle("dark")?"dark":"light";
  localStorage.setItem("siddha-theme",theme);
  renderControls();document.dispatchEvent(new CustomEvent("themechange"));
}
function changeFont(d){
  s=Math.min(1.18,Math.max(.9,s+d));
  localStorage.setItem("siddha-scale",s);
  sync();
}
function renderNav(){
  const file=location.pathname.split("/").pop()||"index.html";
  const items=[["index.html","Home"],["panchangam.html","Panchangam"],["horoscope.html","Horoscope"],["kundali.html","Kundali"],["more.html","More"]];
  const icons={Home:'<path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.8V21h13V9.8M9.5 21v-6.5h5V21"/>',Panchangam:'<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17"/>',Horoscope:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',Kundali:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18"/>',More:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'};
  let nav=document.querySelector(".nav");
  if(!nav){nav=document.createElement("nav");nav.className="nav";nav.setAttribute("aria-label","Primary navigation");(document.querySelector(".app")||document.body).appendChild(nav)}
  nav.innerHTML=items.map(x=>'<a href="'+x[0]+'" class="'+(file===x[0]?"active":"")+'"><svg viewBox="0 0 24 24">'+icons[x[1]]+'</svg><span>'+(lang==="te"?dict[x[1]]:x[1])+'</span></a>').join("");
}
window.SiddhaApp={
  getLanguage:()=>lang,
  setLanguage,
  toggleTheme,
  getTheme:()=>localStorage.getItem("siddha-theme")||"light",
  changeFont,
  getFontScale:()=>s
};

async function getPushRegistration(){
  if(!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window))throw new Error("Push notifications are not supported in this browser.");
  return await navigator.serviceWorker.register("/service-worker.js",{scope:"/"});
}
function urlBase64ToUint8Array(base64String){
  const padding="=".repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");
  const raw=atob(base64);const output=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)output[i]=raw.charCodeAt(i);
  return output;
}
async function getPushConfig(){
  const res=await fetch("/.netlify/functions/push-config",{cache:"no-store"});
  let data={};try{data=await res.json();}catch(e){}
  if(!res.ok||!data.configured||!data.publicKey)throw new Error("Push notifications are not configured on the server yet.");
  return data;
}
async function savePushSubscription(subscription){
  const payload={subscription:subscription.toJSON(),city:localStorage.getItem("siddha-panchang-city")||"hyderabad",language:lang,nakshatra:localStorage.getItem("siddha-janma-nakshatra")||"",rashi:localStorage.getItem("siddha-janma-rashi")||""};
  const res=await fetch("/.netlify/functions/push-subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  if(!res.ok)throw new Error("Could not save notification subscription.");
}
async function enableNotifications(){
  const status=document.querySelector("[data-notification-status]");
  const button=document.querySelector("[data-notifications]");
  try{
    if(status)status.textContent="Setting up notifications…";
    if(button){button.disabled=true;button.textContent="Setting up…";}
    if(location.protocol!=="https:"&&location.hostname!=="localhost")throw new Error("Notifications require a secure HTTPS connection.");
    const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&"ontouchend" in document);
    if(isIOS&&!window.matchMedia("(display-mode: standalone)").matches&&!navigator.standalone)throw new Error("On iPhone/iPad, first add Siddha Astro to the Home Screen and open it from there, then enable notifications.");
    const registration=await getPushRegistration();
    const permission=Notification.permission==="granted"?"granted":await Notification.requestPermission();
    if(permission!=="granted")throw new Error("Notification permission was not granted. You can enable it in iPhone Settings → Notifications → Siddha Astro.");
    const config=await getPushConfig();
    let subscription=await registration.pushManager.getSubscription();
    if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(config.publicKey)});
    await savePushSubscription(subscription);
    if(status)status.textContent="Notifications enabled. Your daily Panchangam will use your saved language, city, Janma Nakshatra and Janma Rashi.";
    if(button){button.textContent="Notifications enabled";button.disabled=false;}
    return true;
  }catch(error){
    console.error("Notification setup failed",error);
    if(status)status.textContent=error?.message||"Unable to enable notifications.";
    if(button){button.textContent="Enable notifications";button.disabled=false;}
    return false;
  }
}
async function syncNotificationPreferences(){
  try{
    const registration=await navigator.serviceWorker?.getRegistration("/");
    const subscription=await registration?.pushManager?.getSubscription();
    if(!subscription)return;
    await savePushSubscription(subscription);
  }catch(error){console.warn("Notification preferences sync failed",error)}
}

document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll("[data-notifications]").forEach(b=>b.onclick=enableNotifications);
  // Keep every page consistent: remove legacy reader controls and image assets,
  // but preserve the global language/font/theme controls.
  document.querySelectorAll('.book-back,.script-back,img[src$="12.png"],img[src*="/12.png"],img[src*="\\\\12.png"],[data-script-language]').forEach(el=>el.remove());
  document.querySelectorAll("a,button").forEach(el=>{
    const t=(el.textContent||"").trim().toLowerCase();
    if(t==="back"||t==="← back"||t==="go back")el.remove();
  });
  renderNav();renderControls();sync();
  languageObserver=new MutationObserver(()=>{if(!translating&&lang==="te")applyLanguage()});
  languageObserver.observe(document.body,{childList:true,subtree:true});
  document.querySelectorAll("[data-theme]").forEach(b=>b.onclick=toggleTheme);
}});})();;