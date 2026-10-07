/* Siddha Astro — Monthly Panchangam Calendar */
(() => {
  const API = "https://shastrapanchangam.com/api/v1";
  const CITY_ALIAS = { hyderabad:"hyderabad", bangalore:"bengaluru", chennai:"chennai", mumbai:"mumbai", delhi:"delhi", rajahmundry:"hyderabad" };
  const TITHI_TE = {
    Pratipada:"పాడ్యమి", Dvitiiya:"విదియ", Dvitiya:"విదియ", Tritiya:"తదియ",
    Chaturthi:"చవితి", Panchami:"పంచమి", Shashthi:"షష్ఠి", Saptami:"సప్తమి",
    Ashtami:"అష్టమి", Navami:"నవమి", Dashami:"దశమి", Ekadashi:"ఏకాదశి",
    Dwadashi:"ద్వాదశి", Trayodashi:"త్రయోదశి", Chaturdashi:"చతుర్దశి",
    Purnima:"పౌర్ణమి", Amavasya:"అమావాస్య"
  };
  const FEST_TE = {
    "Amavasya":"అమావాస్య", "Pournami":"పౌర్ణమి", "Ekadashi":"ఏకాదశి",
    "Sankashti":"సంకష్ట హర చవితి", "Sankashti Chaturthi":"సంకష్ట హర చవితి",
    "Pradosham":"ప్రదోషం", "Sharad Navratri":"శరన్నవరాత్రులు",
    "Durga Ashtami":"దుర్గాష్టమి", "Vijayadashami":"విజయదశమి",
    "Dussehra":"దసరా", "Diwali":"దీపావళి", "Deepavali":"దీపావళి",
    "Dhanteras":"ధనత్రయోదశి", "Naraka Chaturdashi":"నరక చతుర్దశి",
    "Govardhan Puja":"గోవర్ధన పూజ", "Bhai Dooj":"భాయ్ దూజ్",
    "Karwa Chauth":"కర్వా చౌత్", "Maha Shivaratri":"మహా శివరాత్రి",
    "Janmashtami":"శ్రీకృష్ణాష్టమి", "Ganesh Chaturthi":"వినాయక చవితి",
    "Vinayaka Chaturthi":"వినాయక చవితి", "Sankranti":"సంక్రాంతి",
    "Makar Sankranti":"మకర సంక్రాంతి", "Rama Navami":"శ్రీరామ నవమి",
    "Hanuman Jayanti":"హనుమ జయంతి", "Narasimha Jayanti":"నరసింహ జయంతి",
    "Raksha Bandhan":"రక్షాబంధన్", "Krishna Janmashtami":"శ్రీకృష్ణ జన్మాష్టమి", "Mahalakshmi Vrat Ends":"మహాలక్ష్మీ వ్రత సమాప్తి", "Jivitputrika Vrat":"జీవిత్పుత్రికా వ్రతం", "Indira Ekadashi":"ఇందిరా ఏకాదశి", "Guru Pradosh Vrat":"గురు ప్రదోష వ్రతం", "Sarva Pitru Amavasya":"సర్వపితృ అమావాస్య", "Darsha Amavasya":"దర్శ అమావాస్య", "Anvadhan":"అన్వాధానం", "Ashwina Amavasya":"ఆశ్వయుజ అమావాస్య", "Navratri Begins":"నవరాత్రులు ప్రారంభం", "Ghatasthapana":"ఘటస్థాపన", "Chandra Darshana":"చంద్ర దర్శనం", "Upang Lalita Vrat":"ఉపాంగ లలితా వ్రతం", "Saraswati Avahan":"సరస్వతీ ఆవాహనం", "Saraswati Puja":"సరస్వతీ పూజ", "Tula Sankranti":"తులా సంక్రాంతి", "Durga Ashtami":"దుర్గాష్టమి", "Maha Navami":"మహానవమి", "Saraswati Visarjan":"సరస్వతీ విసర్జనం", "Durga Visarjan":"దుర్గా విసర్జనం", "Vijayadashami":"విజయదశమి", "Dussehra":"దసరా", "Papankusha Ekadashi":"పాపాంకుశ ఏకాదశి", "Shukra Pradosh Vrat":"శుక్ర ప్రదోష వ్రతం", "Kojagara Puja":"కోజాగర పూజ", "Sharad Purnima":"శరద్ పౌర్ణమి", "Ashwina Purnima":"ఆశ్వయుజ పౌర్ణమి", "Karwa Chauth":"కర్వా చౌత్", "Vakratunda Sankashti":"వక్రతుండ సంకష్టి"
  };

  let monthCursor = new Date();
  let cached = new Map();

  function indiaTodayDate(){
    const s = new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
    return s;
  }
  function ym(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"); }
  function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
  function esc(v){ return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  const TITHI_NAMES=[
    "Shukla Pratipada","Shukla Dwitiya","Shukla Tritiya","Shukla Chaturthi","Shukla Panchami",
    "Shukla Shashti","Shukla Saptami","Shukla Ashtami","Shukla Navami","Shukla Dashami",
    "Shukla Ekadashi","Shukla Dwadashi","Shukla Trayodashi","Shukla Chaturdashi","Pournami",
    "Krishna Pratipada","Krishna Dwitiya","Krishna Tritiya","Krishna Chaturthi","Krishna Panchami",
    "Krishna Shashti","Krishna Saptami","Krishna Ashtami","Krishna Navami","Krishna Dashami",
    "Krishna Ekadashi","Krishna Dwadashi","Krishna Trayodashi","Krishna Chaturdashi","Amavasya"
  ];
  const NAKSHATRA_NAMES=[
    "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
    "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha",
    "Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha",
    "Purva Bhadrapada","Uttara Bhadrapada","Revati"
  ];
  function namedValue(value,names){
    if(value==null||value==="")return "";
    if(typeof value==="object"){
      if(value.name!=null)return namedValue(value.name,names);
      if(value.index!=null)return namedValue(value.index,names);
      if(value.number!=null)return namedValue(value.number,names);
    }
    const n=Number(value);
    if(Number.isInteger(n)&&n>=0&&n<names.length)return names[n];
    return String(value).trim();
  }
  function tithiName(t){
    const s=namedValue(t,TITHI_NAMES);
    if(!s)return "";
    const m=s.match(/^(Shukla|Krishna)\s+(.+)$/i);
    return m ? m[2] : s;
  }
  function paksha(t){
    const s=namedValue(t,TITHI_NAMES);
    return /^Krishna/i.test(s) ? "Krishna" : /^Shukla/i.test(s) ? "Shukla" : "";
  }
  function tithiDisplay(t,te){
    const raw=namedValue(t,TITHI_NAMES);
    if(!raw)return "—";
    const m=raw.match(/^(Shukla|Krishna)\s+(.+)$/i);
    if(!m)return te ? (TITHI_TE[raw]||raw) : raw;
    const n=te ? (TITHI_TE[m[2]]||m[2]) : m[2];
    return te ? (m[1].toLowerCase()==="krishna"?"కృష్ణ ":"శుక్ల ")+n : m[1]+" "+n;
  }
  function nakshatraDisplay(n,te){
    const raw=namedValue(n,NAKSHATRA_NAMES);
    if(!raw)return "—";
    return te ? ({"Purva Phalguni":"పుబ్బ","Uttara Phalguni":"ఉత్తర ఫల్గుణి","Purva Ashadha":"పూర్వాషాఢ","Uttara Ashadha":"ఉత్తరాషాఢ","Purva Bhadrapada":"పూర్వాభాద్ర","Uttara Bhadrapada":"ఉత్తరాభాద్ర","Mrigashira":"మృగశిర","Jyeshtha":"జ్యేష్ఠ","Dhanishta":"ధనిష్ఠ","Shatabhisha":"శతభిషం","Punarvasu":"పునర్వసు","Pushya":"పుష్యమి","Ashlesha":"ఆశ్లేష","Krittika":"కృత్తిక","Rohini":"రోహిణి","Ardra":"ఆర్ద్ర","Magha":"మఘ","Hasta":"హస్త","Chitra":"చిత్త","Swati":"స్వాతి","Vishakha":"విశాఖ","Anuradha":"అనూరాధ","Mula":"మూల","Shravana":"శ్రవణం","Revati":"రేవతి","Bharani":"భరణి","Ashwini":"అశ్విని"}[raw]||raw) : raw;
  }
  function normalizeRows(payload){
    let rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.days) ? payload.days : []);
    if(!rows.length && payload && typeof payload==="object"){
      for(const [k,v] of Object.entries(payload)){
        if(/^\d{4}-\d{2}-\d{2}$/.test(k)) rows.push({...v,date:k});
      }
    }
    return rows.map(r=>{
      const d=r?.day||r?.panchang||r||{};
      return {
        date:r.date||d.date,
        tithi:d.tithi?.name??d.tithi??"",
        nakshatra:d.nakshatra?.name??d.nakshatra??"",
        moonrise:d.moonrise,
        sunrise:d.sunrise,
        sunset:d.sunset
      };
    }).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(String(x.date||"")));
  }
  function collectFestivalMap(payload,city){
    const map={};
    const cityKey=CITY_ALIAS[city]||city;
    const add=(date,name)=>{
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!name)return;
      (map[date] ||= []).push(String(name));
    };
    const dateList=v=>{
      if(typeof v==="string")return [v];
      if(Array.isArray(v))return v.flatMap(dateList);
      return [];
    };
    const walk=(node)=>{
      if(!node)return;
      if(Array.isArray(node)){node.forEach(walk);return;}
      if(typeof node!=="object")return;
      const name=node.name||node.title||node.festival||node.label;
      let dates=[];
      const ld=node.local_dates||node.localDates;
      if(ld&&typeof ld==="object"){
        dates=dateList(ld[cityKey]||ld[city]||ld.hyderabad||ld.bengaluru);
      }
      if(!dates.length)dates=dateList(node.dates||node.date||node.local_date||node.localDate);
      if(name&&dates.length)dates.forEach(x=>add(String(x).slice(0,10),name));
      Object.values(node).forEach(walk);
    };
    walk(payload);
    return map;
  }
  function inferredFestivals(row){
    const out=[];
    const n=tithiName(row.tithi);
    if(/Amavasya/i.test(n))out.push("Amavasya");
    return out;
  }
  function dedupe(a){return [...new Set(a)];}
  function festivalDateLabel(date,te){
    const d=new Date(date+"T00:00:00");
    return new Intl.DateTimeFormat(te?"te-IN":"en-IN",{day:"numeric",month:"short"}).format(d);
  }
  function renderFestivalList(root,y,m,festivalMap,rows,te){
    const list=root.querySelector("[data-festival-list]");
    const title=root.querySelector("[data-festival-title]");
    const subtitle=root.querySelector("[data-festival-subtitle]");
    if(title)title.textContent=te?"ఈ నెల పండుగలు & వ్రతాలు":"Festivals & Vratas";
    if(subtitle)subtitle.textContent=te?"ఈ నెలలోని ముఖ్యమైన పండుగలు, ఏకాదశి, అమావాస్య, పౌర్ణమి మరియు వ్రతాలు":"Important observances for this month";
    const events=[];
    Object.entries(festivalMap||{}).forEach(([date,names])=>{
      if(date.slice(0,7)!==y+"-"+String(m+1).padStart(2,"0"))return;
      dedupe(names).forEach(name=>events.push({date,name}));
    });
    // Ensure the core lunar observances are represented even if the festival feed omits them.
    rows.forEach(row=>{
      const date=String(row.date||"");
      if(date.slice(0,7)!==y+"-"+String(m+1).padStart(2,"0"))return;
      const n=tithiName(row.tithi);
      if(/Amavasya/i.test(n))events.push({date,name:"Amavasya"});
      if(/Purnima/i.test(n))events.push({date,name:"Pournami"});
      if(/Ekadashi/i.test(n))events.push({date,name:"Ekadashi"});
    });
    const unique=[];
    const seen=new Set();
    events.sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name)).forEach(e=>{
      const key=e.date+"|"+e.name;
      if(!seen.has(key)){seen.add(key);unique.push(e);}
    });
    if(!unique.length){
      list.innerHTML='<div class="monthly-festival-empty">'+(te?"ఈ నెల పండుగల సమాచారం అందుబాటులో లేదు.":"No festival information available for this month.")+'</div>';
      return;
    }
    list.innerHTML=unique.map(e=>'<div class="monthly-festival-row"><div class="monthly-festival-date">'+esc(festivalDateLabel(e.date,te))+'</div><div class="monthly-festival-name">'+esc(labelFestival(e.name,te))+'</div></div>').join("");
  }
  function labelFestival(name,te){
    if(!te)return name;
    return FEST_TE[name]||name;
  }
  function festivalClass(name){
    const s=String(name).toLowerCase();
    if(s.includes("amavas"))return "fc-amavasya";
    if(s.includes("pourn")||s.includes("purn"))return "fc-pournami";
    if(s.includes("ekadashi"))return "fc-ekadashi";
    if(s.includes("sankashti")||s.includes("chaturthi"))return "fc-chaturthi";
    return "fc-festival";
  }
  async function loadMonth(year,month,city){
    const key=year+"-"+String(month+1).padStart(2,"0")+"-"+city;
    if(cached.has(key))return cached.get(key);
    const sourceCity=CITY_ALIAS[city]||"hyderabad";
    const from=year+"-"+String(month+1).padStart(2,"0")+"-01";
    const days=daysInMonth(year,month);

    // Prefer the range endpoint. If an older/browser cache/network path rejects it,
    // fall back to the documented single-day endpoint so every month remains navigable.
    let rows=[];
    try{
      const r=await fetch(API+"/range/"+sourceCity+".json?from="+from+"&days="+days,{headers:{Accept:"application/json"},cache:"no-store"});
      if(!r.ok)throw new Error("Range HTTP "+r.status);
      rows=normalizeRows(await r.json());
    }catch(rangeError){
      const dates=Array.from({length:days},(_,i)=>year+"-"+String(month+1).padStart(2,"0")+"-"+String(i+1).padStart(2,"0"));
      const results=await Promise.allSettled(dates.map(date=>
        fetch(API+"/day/"+sourceCity+"/"+date+".json",{headers:{Accept:"application/json"},cache:"no-store"})
          .then(r=>{if(!r.ok)throw new Error("Day HTTP "+r.status);return r.json()})
          .then(payload=>normalizeRows(payload)[0])
      ));
      rows=results.filter(x=>x.status==="fulfilled"&&x.value).map(x=>x.value);
      if(!rows.length)throw rangeError;
    }

    let festivalMap={};
    try{
      const fr=await fetch(API+"/festivals.json",{headers:{Accept:"application/json"},cache:"no-store"});
      if(fr.ok)festivalMap=collectFestivalMap(await fr.json(),sourceCity);
    }catch(e){
      console.warn("Festival calendar unavailable",e);
    }
    const data={rows,festivalMap,sourceCity};
    cached.set(key,data);
    return data;
  }
  function render(){
    const root=document.getElementById("monthlyCalendar");
    if(!root)return;
    const te=SiddhaApp.getLanguage()==="te";
    const y=monthCursor.getFullYear(),m=monthCursor.getMonth();
    const monthName=new Intl.DateTimeFormat(te?"te-IN":"en-IN",{month:"long",year:"numeric"}).format(monthCursor);
    const weekdays=te?["ఆది","సోమ","మంగళ","బుధ","గురు","శుక్ర","శని"]:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    root.querySelector("[data-month-title]").textContent=monthName;
    root.querySelector("[data-calendar-note]").textContent=te?"తిథి, నక్షత్రం మరియు ముఖ్య వ్రతాలు":"Tithi, Nakshatra & important observances";
    const grid=root.querySelector("[data-calendar-grid]");
    grid.innerHTML=weekdays.map(x=>'<div class="calendar-weekday">'+x+'</div>').join("");
    const first=new Date(y,m,1).getDay();
    for(let i=0;i<first;i++)grid.insertAdjacentHTML("beforeend",'<div class="calendar-day calendar-empty"></div>');
    loadMonth(y,m,document.getElementById("pcity").value).then(({rows,festivalMap,sourceCity})=>{
      const byDate=Object.fromEntries(rows.map(r=>[r.date,r]));
      renderFestivalList(root,y,m,festivalMap,rows,te);
      const today=indiaTodayDate();
      for(let d=1;d<=daysInMonth(y,m);d++){
        const date=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
        const row=byDate[date]||{date};
        const names=dedupe([...(festivalMap[date]||[]),...inferredFestivals(row)]);
        const teNow=SiddhaApp.getLanguage()==="te";
        const festivalHtml=names.slice(0,3).map(n=>'<span class="calendar-chip '+festivalClass(n)+'">'+esc(labelFestival(n,teNow))+'</span>').join("");
        const selected=document.getElementById("pdate")?.value===date;
        grid.insertAdjacentHTML("beforeend",
          '<button type="button" class="calendar-day '+(date===today?"calendar-today ":"")+(selected?"calendar-selected":"")+'" data-calendar-date="'+date+'">'+
          '<span class="calendar-date">'+d+'</span>'+
          '<span class="calendar-tithi">'+esc(tithiDisplay(row.tithi,teNow))+'</span>'+
          '<span class="calendar-nakshatra">'+esc(nakshatraDisplay(row.nakshatra,teNow))+'</span>'+
          (festivalHtml?'<span class="calendar-festivals">'+festivalHtml+'</span>':"")+
          '</button>'
        );
      }
      grid.querySelectorAll("[data-calendar-date]").forEach(btn=>btn.onclick=()=>{
        const date=btn.getAttribute("data-calendar-date");
        const input=document.getElementById("pdate");
        if(input)input.value=date;
        document.getElementById("loadP")?.click();
        setTimeout(()=>document.getElementById("panchangamDaily")?.scrollIntoView({behavior:"smooth",block:"start"}),50);
        grid.querySelectorAll(".calendar-selected").forEach(x=>x.classList.remove("calendar-selected"));
        btn.classList.add("calendar-selected");
      });
      root.querySelector("[data-calendar-status]").textContent=sourceCity!==document.getElementById("pcity").value
        ? (teNow?"రాజమండ్రి కోసం సమీప లభ్యమైన నగర డేటా ఉపయోగించబడింది.":"Using the nearest available calendar city data for this selection.")
        : "";
    }).catch(e=>{
      root.querySelector("[data-calendar-status]").textContent=te?"క్యాలెండర్ లోడ్ కాలేదు. మళ్లీ ప్రయత్నించండి.":"Unable to load the monthly calendar. Please try again.";
      console.error(e);
    });
  }
  function init(){
    const root=document.getElementById("monthlyCalendar");
    if(!root)return;
    root.querySelector("[data-prev-month]").onclick=()=>{monthCursor=new Date(monthCursor.getFullYear(),monthCursor.getMonth()-1,1);render()};
    root.querySelector("[data-next-month]").onclick=()=>{monthCursor=new Date(monthCursor.getFullYear(),monthCursor.getMonth()+1,1);render()};
    root.querySelector("[data-this-month]").onclick=()=>{const d=new Date();monthCursor=new Date(d.getFullYear(),d.getMonth(),1);render()};
    document.addEventListener("languagechange",render);
    document.getElementById("pcity")?.addEventListener("change",render);
    document.getElementById("loadP")?.addEventListener("click",()=>setTimeout(render,250));
    render();
  }
  document.addEventListener("DOMContentLoaded",init);
})();