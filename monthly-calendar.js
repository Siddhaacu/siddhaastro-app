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
    "Raksha Bandhan":"రక్షాబంధన్", "Krishna Janmashtami":"శ్రీకృష్ణ జన్మాష్టమి"
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
  function tithiName(t){
    if(!t)return "";
    const s=String(t.name||t).trim();
    const m=s.match(/^(Shukla|Krishna)\s+(.+)$/i);
    return m ? m[2] : s;
  }
  function paksha(t){
    const s=String(t?.name||t||"");
    return /^Krishna/i.test(s) ? "Krishna" : /^Shukla/i.test(s) ? "Shukla" : "";
  }
  function tithiDisplay(t,te){
    const raw=String(t?.name||t||"").trim();
    const m=raw.match(/^(Shukla|Krishna)\s+(.+)$/i);
    if(!m)return te ? (TITHI_TE[raw]||raw) : raw;
    const n=te ? (TITHI_TE[m[2]]||m[2]) : m[2];
    return (te ? (m[1].toLowerCase()==="krishna"?"కృష్ణ ":"శుక్ల ") : (m[1].toLowerCase()==="krishna"?"Kr. ":"Sh. "))+n;
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
        tithi:d.tithi?.name||d.tithi||"",
        nakshatra:d.nakshatra?.name||d.nakshatra||"",
        moonrise:d.moonrise,
        sunrise:d.sunrise,
        sunset:d.sunset
      };
    }).filter(x=>x.date);
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
    const t=String(row.tithi||"");
    const n=tithiName(t);
    const p=paksha(t);
    if(/Amavasya/i.test(n))out.push("Amavasya");
    if(/Purnima/i.test(n))out.push("Pournami");
    if(/Ekadashi/i.test(n))out.push("Ekadashi");
    if(/Chaturthi/i.test(n)&&/Krishna/i.test(p))out.push("Sankashti Chaturthi");
    if(/Chaturthi/i.test(n)&&/Shukla/i.test(p))out.push("Ganesh Chaturthi");
    if(/Trayodashi/i.test(n))out.push("Pradosham");
    if(/Chaturdashi/i.test(n)&&/Krishna/i.test(p))out.push("Masik Shivaratri");
    return out;
  }
  function dedupe(a){return [...new Set(a)];}
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
    const [rangeRes,festRes]=await Promise.allSettled([
      fetch(API+"/range/"+sourceCity+".json?from="+from+"&days="+days,{headers:{Accept:"application/json"}}).then(r=>{if(!r.ok)throw new Error("Calendar HTTP "+r.status);return r.json()}),
      fetch(API+"/festivals.json",{headers:{Accept:"application/json"}}).then(r=>{if(!r.ok)throw new Error("Festival HTTP "+r.status);return r.json()})
    ]);
    if(rangeRes.status!=="fulfilled")throw rangeRes.reason;
    const rows=normalizeRows(rangeRes.value);
    const festivalMap=festRes.status==="fulfilled"?collectFestivalMap(festRes.value,sourceCity):{};
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
    root.querySelector("[data-calendar-note]").textContent=te?"తిథి ఆధారిత ముఖ్య వ్రతాలు మరియు పండుగలు • నగరం: "+(SiddhaPanchangam.cities[document.getElementById("pcity").value]?.name||"Hyderabad"):"Tithi-based observances and festivals • City: "+(SiddhaPanchangam.cities[document.getElementById("pcity").value]?.name||"Hyderabad");
    const grid=root.querySelector("[data-calendar-grid]");
    grid.innerHTML=weekdays.map(x=>'<div class="calendar-weekday">'+x+'</div>').join("");
    const first=new Date(y,m,1).getDay();
    for(let i=0;i<first;i++)grid.insertAdjacentHTML("beforeend",'<div class="calendar-day calendar-empty"></div>');
    loadMonth(y,m,document.getElementById("pcity").value).then(({rows,festivalMap,sourceCity})=>{
      const byDate=Object.fromEntries(rows.map(r=>[r.date,r]));
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
          '<span class="calendar-nakshatra">'+esc(row.nakshatra||"")+'</span>'+
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