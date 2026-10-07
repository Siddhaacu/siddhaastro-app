/* Siddha Astro — Monthly Panchangam Calendar */
// Festival completeness patch: parse nested city/date maps, infer core observances, and include the complete 2026-10 fallback.
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
    "Raksha Bandhan":"రక్షాబంధన్", "Krishna Janmashtami":"శ్రీకృష్ణ జన్మాష్టమి", "Mahalakshmi Vrat Ends":"మహాలక్ష్మీ వ్రత సమాప్తి", "Jivitputrika Vrat":"జీవిత్పుత్రికా వ్రతం", "Indira Ekadashi":"ఇందిరా ఏకాదశి", "Guru Pradosh Vrat":"గురు ప్రదోష వ్రతం", "Sarva Pitru Amavasya":"సర్వపితృ అమావాస్య", "Darsha Amavasya":"దర్శ అమావాస్య", "Anvadhan":"అన్వాధానం", "Ashwina Amavasya":"ఆశ్వయుజ అమావాస్య", "Navratri Begins":"నవరాత్రులు ప్రారంభం", "Ghatasthapana":"ఘటస్థాపన", "Chandra Darshana":"చంద్ర దర్శనం", "Upang Lalita Vrat":"ఉపాంగ లలితా వ్రతం", "Saraswati Avahan":"సరస్వతీ ఆవాహనం", "Saraswati Puja":"సరస్వతీ పూజ", "Tula Sankranti":"తులా సంక్రాంతి", "Durga Ashtami":"దుర్గాష్టమి", "Maha Navami":"మహానవమి", "Saraswati Visarjan":"సరస్వతీ విసర్జనం", "Durga Visarjan":"దుర్గా విసర్జనం", "Vijayadashami":"విజయదశమి", "Dussehra":"దసరా", "Papankusha Ekadashi":"పాపాంకుశ ఏకాదశి", "Shukra Pradosh Vrat":"శుక్ర ప్రదోష వ్రతం", "Kojagara Puja":"కోజాగర పూజ", "Sharad Purnima":"శరద్ పౌర్ణమి", "Ashwina Purnima":"ఆశ్వయుజ పౌర్ణమి", "Karwa Chauth":"కర్వా చౌత్", "Vakratunda Sankashti":"వక్రతుండ సంకష్టి", "Ishti":"ఇష్టి"
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
      if(typeof v==="string")return /^\\d{4}-\\d{2}-\\d{2}/.test(v) ? [v] : [];
      if(Array.isArray(v))return v.flatMap(dateList);
      if(v&&typeof v==="object")return Object.values(v).flatMap(dateList);
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
    const full=namedValue(row.tithi,TITHI_NAMES);
    const n=tithiName(row.tithi);
    if(/Amavasya/i.test(n))out.push("Amavasya");
    if(/Pournami|Purnima/i.test(n))out.push("Pournami");
    if(/Ekadashi/i.test(n))out.push("Ekadashi");
    if(/Trayodashi/i.test(n))out.push("Pradosham");
    if(/Krishna Chaturthi/i.test(full))out.push("Sankashti Chaturthi");
    if(/Krishna Chaturdashi/i.test(full))out.push("Masik Shivaratri");
    if(/Shukla Ashtami/i.test(full))out.push("Masik Durgashtami");
    if(/Shukla Shashti/i.test(full))out.push("Skanda Sashti");
    if(/Shukla Dwadashi/i.test(full))out.push("Dwadashi");
    return out;
  }
  const KNOWN_FESTIVALS={
    "2026-01-14":["Makara Sankranti","Pongal"],"2026-01-23":["Vasant Panchami"],
    "2026-02-15":["Maha Shivaratri"],"2026-03-03":["Holika Dahan"],"2026-03-04":["Holi"],
    "2026-03-19":["Ugadi","Gudi Padwa"],"2026-03-26":["Rama Navami"],"2026-04-14":["Mesha Sankranti","Solar New Year"],
    "2026-05-01":["Buddha Purnima"],"2026-07-16":["Jagannath Rathyatra"],"2026-07-29":["Guru Purnima"],
    "2026-08-26":["Onam"],"2026-08-28":["Raksha Bandhan"],"2026-09-04":["Krishna Janmashtami"],
    "2026-09-14":["Ganesh Chaturthi"],
    "2026-10-03":["Mahalakshmi Vrat Ends","Jivitputrika Vrat"],"2026-10-06":["Indira Ekadashi"],
    "2026-10-08":["Guru Pradosh Vrat"],"2026-10-10":["Sarva Pitru Amavasya","Darsha Amavasya","Anvadhan","Ashwina Amavasya"],
    "2026-10-11":["Navratri Begins","Ghatasthapana","Ishti"],"2026-10-12":["Chandra Darshana"],"2026-10-15":["Upang Lalita Vrat"],
    "2026-10-16":["Saraswati Avahan"],"2026-10-17":["Saraswati Puja","Tula Sankranti"],"2026-10-19":["Durga Ashtami","Maha Navami","Saraswati Visarjan"],
    "2026-10-20":["Durga Visarjan","Dussehra"],"2026-10-22":["Papankusha Ekadashi"],"2026-10-23":["Shukra Pradosh Vrat"],
    "2026-10-25":["Kojagara Puja","Sharad Purnima","Anvadhan"],"2026-10-26":["Ashwina Purnima","Ishti"],"2026-10-29":["Karwa Chauth","Vakratunda Sankashti"],
    "2026-11-08":["Dhanteras","Naraka Chaturdashi","Lakshmi Puja","Deepavali"],"2026-11-10":["Govardhan Puja"],"2026-11-11":["Bhai Dooj"],"2026-11-15":["Chhath Puja"],"2026-11-24":["Kartika Purnima","Guru Nanak Jayanti"],
    "2027-01-15":["Makara Sankranti","Pongal"],"2027-02-11":["Vasant Panchami"],"2027-03-06":["Maha Shivaratri"],"2027-03-21":["Holika Dahan"],"2027-03-22":["Holi"],
    "2027-04-07":["Ugadi","Gudi Padwa"],"2027-04-15":["Rama Navami"],"2027-04-14":["Mesha Sankranti","Solar New Year"],
    "2027-05-20":["Buddha Purnima"],"2027-07-05":["Jagannath Rathyatra"],"2027-07-18":["Guru Purnima"],"2027-08-17":["Raksha Bandhan"],
    "2027-08-25":["Krishna Janmashtami"],"2027-09-04":["Ganesh Chaturthi"],"2027-10-07":["Durga Ashtami"],"2027-10-08":["Maha Navami"],
    "2027-10-09":["Dussehra"],"2027-10-18":["Karwa Chauth"],"2027-10-28":["Naraka Chaturdashi"],
    "2027-10-29":["Dhanteras","Lakshmi Puja","Deepavali"],"2027-10-30":["Govardhan Puja"],"2027-10-31":["Bhai Dooj"],
    "2027-11-04":["Chhath Puja"],"2027-11-14":["Kartika Purnima","Guru Nanak Jayanti"],
    "2028-01-15":["Makara Sankranti","Pongal"],"2028-01-31":["Vasant Panchami"],"2028-02-23":["Maha Shivaratri"],
    "2028-03-10":["Holika Dahan"],"2028-03-11":["Holi"],"2028-03-27":["Ugadi","Gudi Padwa"],"2028-04-03":["Rama Navami"],
    "2028-04-13":["Mesha Sankranti","Solar New Year"],"2028-05-08":["Buddha Purnima"],"2028-06-24":["Jagannath Rathyatra"],
    "2028-07-06":["Guru Purnima"],"2028-08-05":["Raksha Bandhan"],"2028-08-13":["Krishna Janmashtami"],"2028-08-23":["Ganesh Chaturthi"],
    "2028-09-01":["Onam"],"2028-09-26":["Durga Ashtami","Maha Navami"],"2028-09-27":["Dussehra"],"2028-10-07":["Karwa Chauth"],
    "2028-10-17":["Dhanteras","Naraka Chaturdashi","Lakshmi Puja","Deepavali"],"2028-10-18":["Govardhan Puja"],
    "2028-10-19":["Bhai Dooj"],"2028-10-23":["Chhath Puja"],"2028-11-02":["Kartika Purnima","Guru Nanak Jayanti"],
    "2029-01-14":["Makara Sankranti","Pongal"],"2029-01-19":["Vasant Panchami"],"2029-02-11":["Maha Shivaratri"],
    "2029-02-28":["Holika Dahan"],"2029-03-01":["Holi"],"2029-04-14":["Ugadi","Gudi Padwa","Mesha Sankranti","Solar New Year"],
    "2029-04-23":["Rama Navami"],"2029-05-27":["Buddha Purnima"],"2029-07-13":["Jagannath Rathyatra"],"2029-07-25":["Guru Purnima"],
    "2029-08-23":["Raksha Bandhan"],"2029-09-01":["Krishna Janmashtami"],"2029-09-11":["Ganesh Chaturthi"],
    "2029-10-14":["Durga Ashtami"],"2029-10-15":["Maha Navami"],"2029-10-16":["Dussehra"],"2029-10-26":["Karwa Chauth"],
    "2029-11-05":["Dhanteras","Naraka Chaturdashi","Lakshmi Puja","Deepavali"],"2029-11-06":["Govardhan Puja"],
    "2029-11-07":["Bhai Dooj"],"2029-11-11":["Chhath Puja"],"2029-11-21":["Kartika Purnima","Guru Nanak Jayanti"],
    "2030-01-14":["Makara Sankranti","Pongal"],"2030-02-07":["Vasant Panchami"],"2030-03-02":["Maha Shivaratri"],
    "2030-03-19":["Holika Dahan"],"2030-03-20":["Holi"],"2030-04-03":["Ugadi","Gudi Padwa"],"2030-04-12":["Rama Navami"],
    "2030-04-14":["Mesha Sankranti","Solar New Year"],"2030-05-17":["Buddha Purnima"],"2030-07-02":["Jagannath Rathyatra"],
    "2030-07-15":["Guru Purnima"],"2030-08-13":["Raksha Bandhan"],"2030-08-21":["Krishna Janmashtami"],"2030-09-01":["Ganesh Chaturthi"],
    "2030-09-09":["Onam"],"2030-10-04":["Durga Ashtami"],"2030-10-05":["Maha Navami"],"2030-10-06":["Dussehra"],"2030-10-15":["Karwa Chauth"],
    "2030-10-26":["Dhanteras","Naraka Chaturdashi","Lakshmi Puja","Deepavali"],"2030-10-27":["Govardhan Puja"],"2030-10-28":["Bhai Dooj"],
    "2030-11-01":["Chhath Puja"],"2030-11-10":["Kartika Purnima","Guru Nanak Jayanti"],
    "2031-01-15":["Makara Sankranti","Pongal"],"2031-01-27":["Vasant Panchami"],"2031-02-20":["Maha Shivaratri"],
    "2031-03-08":["Holika Dahan"],"2031-03-09":["Holi"],"2031-03-24":["Ugadi","Gudi Padwa"],
    "2031-04-01":["Rama Navami"],"2031-04-14":["Mesha Sankranti","Solar New Year"],"2031-05-07":["Buddha Purnima"],
    "2031-06-22":["Jagannath Rathyatra"],"2031-07-04":["Guru Purnima"],"2031-08-02":["Raksha Bandhan"],"2031-08-09":["Krishna Janmashtami"],
    "2031-09-20":["Ganesh Chaturthi"],"2031-08-30":["Onam"],"2031-10-23":["Durga Ashtami"],"2031-10-24":["Maha Navami"],"2031-10-25":["Dussehra"],
    "2031-11-02":["Karwa Chauth"],"2031-11-13":["Naraka Chaturdashi"],"2031-11-14":["Dhanteras","Lakshmi Puja","Deepavali"],
    "2031-11-15":["Govardhan Puja"],"2031-11-16":["Bhai Dooj"],"2031-11-20":["Chhath Puja"],"2031-11-28":["Kartika Purnima","Karthika Deepam","Guru Nanak Jayanti"],
    "2026-01-15":["Kanuma"],"2026-01-16":["Mukkanuma"],"2026-01-25":["Ratha Saptami"],"2026-08-21":["Varalakshmi Vratam"],"2026-08-26":["Raksha Bandhan"],"2026-09-14":["Vinayaka Chavithi"],"2026-11-13":["Nagula Chavithi"],"2026-11-20":["Devutthana Ekadashi"],"2026-11-24":["Karthika Purnima","Karthika Deepam"],"2026-12-14":["Naga Panchami"],"2026-12-20":["Vaikuntha Ekadashi"],
    "2027-02-13":["Ratha Saptami"],"2027-05-31":["Hanuman Jayanti"],"2027-07-04":["Bonalu"],"2027-07-14":["Tholi Ekadashi"],"2027-08-06":["Naga Panchami"],"2027-08-13":["Varalakshmi Vratam"],"2027-09-04":["Vinayaka Chavithi"],"2027-11-02":["Nagula Chavithi"],"2027-11-11":["Ksheerabdi Dwadashi (Tulasi Vivah)"],"2027-11-14":["Karthika Purnima","Karthika Deepam"],"2027-12-03":["Subrahmanya Shashti"],"2027-12-13":["Dattatreya Jayanti"],
    "2028-02-03":["Ratha Saptami"],"2028-05-19":["Hanuman Jayanti"],"2028-08-04":["Varalakshmi Vratam"],"2028-08-23":["Vinayaka Chavithi"],"2028-10-21":["Nagula Chavithi"],"2028-10-30":["Ksheerabdi Dwadashi (Tulasi Vivah)"],"2028-11-02":["Karthika Purnima","Karthika Deepam"],"2028-11-21":["Subrahmanya Shashti"],"2028-12-01":["Dattatreya Jayanti"],
    "2029-01-22":["Ratha Saptami"],"2029-06-06":["Hanuman Jayanti"],"2029-08-24":["Varalakshmi Vratam"],"2029-09-11":["Vinayaka Chavithi"],"2029-11-09":["Nagula Chavithi"],"2029-11-17":["Ksheerabdi Dwadashi (Tulasi Vivah)"],"2029-11-21":["Karthika Purnima","Karthika Deepam"],"2029-12-10":["Subrahmanya Shashti"],"2029-12-20":["Dattatreya Jayanti"],
    "2030-01-09":["Ratha Saptami"],"2030-05-26":["Hanuman Jayanti"],"2030-08-09":["Varalakshmi Vratam"],"2030-09-01":["Vinayaka Chavithi"],"2030-10-30":["Nagula Chavithi"],"2030-11-06":["Ksheerabdi Dwadashi (Tulasi Vivah)"],"2030-11-10":["Karthika Purnima","Karthika Deepam"],"2030-11-29":["Subrahmanya Shashti"],"2030-12-09":["Dattatreya Jayanti"],
    "2031-01-29":["Ratha Saptami"],"2031-05-16":["Hanuman Jayanti"],"2031-08-01":["Varalakshmi Vratam"],"2031-09-20":["Vinayaka Chavithi"],"2031-11-18":["Nagula Chavithi"],"2031-11-25":["Ksheerabdi Dwadashi (Tulasi Vivah)"],"2031-11-28":["Karthika Purnima","Karthika Deepam"],"2031-12-19":["Subrahmanya Shashti"],"2031-12-28":["Dattatreya Jayanti"]
  };

  const SANKRANTI_NAMES=["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrischika","Dhanu","Makara","Kumbha","Meena"];
  const SANKRANTI_TE={Mesha:"మేష సంక్రాంతి",Vrishabha:"వృషభ సంక్రాంతి",Mithuna:"మిథున సంక్రాంతి",Karka:"కర్కాటక సంక్రాంతి",Simha:"సింహ సంక్రాంతి",Kanya:"కన్యా సంక్రాంతి",Tula:"తులా సంక్రాంతి",Vrischika:"వృశ్చిక సంక్రాంతి",Dhanu:"ధనుస్సు సంక్రాంతి",Makara:"మకర సంక్రాంతి",Kumbha:"కుంభ సంక్రాంతి",Meena:"మీన సంక్రాంతి"};

  function knownFestivalMapForMonth(y,m){
    const map={};
    Object.entries(KNOWN_FESTIVALS).forEach(([date,names])=>{
      if(date.slice(0,7)===y+"-"+String(m+1).padStart(2,"0"))map[date]=names.slice();
    });
    return map;
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
      inferredFestivals(row).filter(name=>!/^(Amavasya|Pournami|Ekadashi)$/.test(name))
        .forEach(name=>events.push({date,name}));
    });
    // October 2026 has a complete regional festival set used as a safety fallback
    // so the list remains complete even if the remote festival feed is unavailable.
    Object.entries(KNOWN_FESTIVALS).forEach(([date,names])=>{
      if(date.slice(0,7)===y+"-"+String(m+1).padStart(2,"0"))names.forEach(name=>events.push({date,name}));
    });
    const unique=[];
    const seen=new Set();
    // Prefer specific festival names over generic lunar labels on the same date.
    const genericNames=new Set(["Amavasya","Pournami","Ekadashi","Pradosham","Sankashti Chaturthi","Masik Shivaratri"]);
    const byDate={};
    events.forEach(e=>(byDate[e.date] ||= []).push(e));
    const filtered=events.filter(e=>{
      const sameDate=byDate[e.date]||[];
      const hasSpecific=sameDate.some(x=>!genericNames.has(x.name));
      return !(hasSpecific && genericNames.has(e.name));
    });
    filtered.sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name)).forEach(e=>{
      const key=e.date+"|"+e.name;
      if(!seen.has(key)){seen.add(key);unique.push(e);}
    });
    if(!unique.length){
      list.innerHTML='<div class="monthly-festival-empty">'+(te?"ఈ నెల పండుగల సమాచారం అందుబాటులో లేదు.":"No festival information available for this month.")+'</div>';
      return;
    }
    list.innerHTML=unique.map(e=>'<div class="monthly-festival-row"><div class="monthly-festival-date">'+esc(festivalDateLabel(e.date,te))+'</div><div class="monthly-festival-name">'+esc(labelFestival(e.name,te))+'</div></div>').join("");
  }
  Object.assign(FEST_TE,{
    "Makara Sankranti":"మకర సంక్రాంతి","Pongal":"పొంగల్","Bhogi":"భోగి","Kanuma":"కనుమ","Mukkanuma":"ముక్కనుమ",
    "Vasant Panchami":"వసంత పంచమి","Ratha Saptami":"రథ సప్తమి","Maha Shivaratri":"మహా శివరాత్రి","Holika Dahan":"హోలికా దహనం","Holi":"హోళీ",
    "Ugadi":"ఉగాది","Gudi Padwa":"గుడి పడ్వా","Rama Navami":"శ్రీ రామ నవమి","Akshaya Tritiya":"అక్షయ తృతీయ","Hanuman Jayanti":"హనుమాన్ జయంతి",
    "Jagannath Rathyatra":"జగన్నాథ రథయాత్ర","Guru Purnima":"గురు పౌర్ణమి","Naga Panchami":"నాగ పంచమి","Varalakshmi Vratam":"వరలక్ష్మీ వ్రతం",
    "Raksha Bandhan":"రక్షా బంధన్","Krishna Janmashtami":"శ్రీ కృష్ణ జన్మాష్టమి","Ganesh Chaturthi":"వినాయక చవితి","Vinayaka Chavithi":"వినాయక చవితి",
    "Navratri Begins":"నవరాత్రులు ప్రారంభం","Ghatasthapana":"ఘటస్థాపన","Durga Ashtami":"దుర్గాష్టమి","Maha Navami":"మహానవమి",
    "Dussehra":"దసరా","Vijayadashami":"విజయదశమి","Atla Tadde":"అట్ల తద్దె","Naraka Chaturdashi":"నరక చతుర్దశి","Dhanteras":"ధన త్రయోదశి",
    "Lakshmi Puja":"లక్ష్మీ పూజ","Deepavali":"దీపావళి","Diwali":"దీపావళి","Govardhan Puja":"గోవర్ధన పూజ","Bhai Dooj":"భాయ్ దూజ్",
    "Nagula Chavithi":"నాగుల చవితి","Devutthana Ekadashi":"దేవుత్థాన ఏకాదశి","Ksheerabdi Dwadashi (Tulasi Vivah)":"క్షీరాబ్ధి ద్వాదశి (తులసీ వివాహం)",
    "Tulasi Vivah":"తులసీ వివాహం","Karthika Purnima":"కార్తీక పౌర్ణమి","Kartika Purnima":"కార్తీక పౌర్ణమి","Karthika Deepam":"కార్తీక దీపం",
    "Subrahmanya Shashti":"సుబ్రహ్మణ్య షష్ఠి","Dattatreya Jayanti":"దత్తాత్రేయ జయంతి","Mukkoti (Vaikuntha) Ekadashi":"ముక్కోటి వైకుంఠ ఏకాదశి",
    "Vaikuntha Ekadashi":"వైకుంఠ ఏకాదశి","Tholi Ekadashi":"తొలి ఏకాదశి","Nirjala Ekadashi":"నిర్జల ఏకాదశి","Bonalu":"బోనాలు",
    "Bathukamma":"బతుకమ్మ","Karthika Somavaram":"కార్తీక సోమవారం","Karthika Masam":"కార్తీక మాసం","Sankashti Chaturthi":"సంకష్టహర చతుర్థి",
    "Masik Shivaratri":"మాస శివరాత్రి"
  });

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

    let rows=[];
    // Shastra covers the current historical window; Nitya Panchangam supports
    // future dates through 2100 and also gives Sun longitude for Sankranti detection.
    if(year>2027){
      const dates=Array.from({length:days},(_,i)=>year+"-"+String(month+1).padStart(2,"0")+"-"+String(i+1).padStart(2,"0"));
      const results=await Promise.allSettled(dates.map(date=>
        fetch("https://nityapanchangam.com/api/panchangam.php?date="+date+"&city=hyderabad",{headers:{Accept:"application/json"},cache:"no-store"})
          .then(r=>{if(!r.ok)throw new Error("Nitya HTTP "+r.status);return r.json()})
          .then(p=>({date:p.date,tithi:p.tithi?.name||"",nakshatra:p.nakshatra?.name||"",sunrise:p.sun?.sunrise,sunset:p.sun?.sunset,sunLongitude:p.sun_longitude}))
      ));
      rows=results.filter(x=>x.status==="fulfilled"&&x.value).map(x=>x.value);
      if(!rows.length)throw new Error("Future Panchang data unavailable");
    }else{
      // Prefer the range endpoint. If an older/browser cache/network path rejects it,
      // fall back to the documented single-day endpoint so every month remains navigable.
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
    }
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

    let festivalMap=knownFestivalMapForMonth(year,month);
    if(year<=2027){
      try{
        const fr=await fetch(API+"/festivals.json",{headers:{Accept:"application/json"},cache:"no-store"});
        if(fr.ok){
          const feed=collectFestivalMap(await fr.json(),sourceCity);
          Object.entries(feed).forEach(([date,names])=>festivalMap[date]=dedupe([...(festivalMap[date]||[]),...names]));
        }
      }catch(e){ console.warn("Festival feed unavailable",e); }
    }
    // Detect every solar ingress (Sankranti) from Sun's sidereal longitude for future years.
    if(rows.some(r=>Number.isFinite(Number(r.sunLongitude)))){
      rows.forEach((row,i)=>{
        const cur=Number(row.sunLongitude);
        const prev=i>0?Number(rows[i-1].sunLongitude):NaN;
        if(Number.isFinite(cur)&&Number.isFinite(prev)){
          const a=Math.floor(((prev%360)+360)%360/30),b=Math.floor(((cur%360)+360)%360/30);
          if(a!==b){
            const name=SANKRANTI_NAMES[b]+" Sankranti";
            (festivalMap[row.date] ||= []).push(name);
          }
        }
      });
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