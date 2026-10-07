import webpush from "web-push";
import {getStore} from "@netlify/blobs";

const STORE_NAME="siddha-astro-push";
const PANCHANG_API="https://nityapanchangam.com/api/panchangam.php";
const ENRICH_API="https://jagannatha-hora-359167915530.europe-west1.run.app/panchang";
const CITIES={
  hyderabad:{name:"Hyderabad",lat:17.385,lng:78.486,slug:"hyderabad"},
  bangalore:{name:"Bengaluru",lat:12.9716,lng:77.5946,slug:"bangalore"},
  chennai:{name:"Chennai",lat:13.0827,lng:80.2707,slug:"chennai"},
  mumbai:{name:"Mumbai",lat:19.076,lng:72.8777,slug:"mumbai"},
  delhi:{name:"Delhi",lat:28.6139,lng:77.209,slug:"delhi"},
  rajahmundry:{name:"Rajahmundry",lat:16.9891,lng:81.2292,slug:null}
};

const NAKSHATRAS=["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const RASHIS=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const TARA_NAMES=["Janma","Sampat","Vipat","Kshema","Pratyari","Sadhana","Naidhana","Mitra","Parama Mitra"];
const TARA_TE=["జన్మ","సంపత్","విపత్","క్షేమ","ప్రత్యరి","సాధన","నైధన","మిత్ర","పరమ మిత్ర"];
const TARA_VERDICT=["Mixed","Favourable","Caution","Favourable","Caution","Favourable","Avoid","Favourable","Favourable"];
function indexByName(value,list){const v=String(value||"").toLowerCase();return list.findIndex(x=>v.includes(x.toLowerCase()));}
function personalStrength(record,p){
  const bi=indexByName(record.nakshatra,NAKSHATRAS),ci=indexByName(p.nakshatra,NAKSHATRAS);
  const br=indexByName(record.rashi,RASHIS),cr=indexByName(p.rashi,RASHIS);
  if(bi<0&&br<0)return null;
  let taraText="",chandraText="";
  if(bi>=0&&ci>=0){const n=((ci-bi+27)%27)%9||9;taraText=(record.language==="te"?TARA_TE[n-1]:TARA_NAMES[n-1])+" • "+(record.language==="te"?(TARA_VERDICT[n-1]==="Favourable"?"అనుకూలం":TARA_VERDICT[n-1]==="Caution"?"జాగ్రత్త":TARA_VERDICT[n-1]==="Avoid"?"వర్జించాలి":"మిశ్రమం"):TARA_VERDICT[n-1]);}
  if(br>=0&&cr>=0){const pos=(cr-br+12)%12+1;const strong=[1,3,6,7,10,11].includes(pos);chandraText=strong?(record.language==="te"?"అనుకూలం":"Favourable"):(record.language==="te"?"జాగ్రత్త":"Caution");}
  return {taraText,chandraText};
}

function indiaToday(){
  return new Intl.DateTimeFormat("en-CA",{
    timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"
  }).format(new Date());
}

async function getPanchang(cityKey,date){
  const c=CITIES[cityKey]||CITIES.hyderabad;
  const q=new URLSearchParams({date,city:c.slug||"hyderabad"});
  const primary=await fetch(PANCHANG_API+"?"+q,{headers:{Accept:"application/json"}});
  if(!primary.ok)throw new Error("Panchang API HTTP "+primary.status);
  const d=await primary.json();
  const base={
    date,
    city:c.name,
    tithi:d.tithi?.name||"—",
    nakshatra:d.nakshatra?.name||"—",
    rashi:d.rashi?.name||"—",
    sunrise:d.sun?.sunrise||d.sunrise||"—",
    sunset:d.sun?.sunset||d.sunset||"—"
  };

  try{
    const enrich=await fetch(ENRICH_API,{
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify({
        date,latitude:c.lat,longitude:c.lng,timezone:5.5,ayanamsa_mode:"LAHIRI"
      })
    });
    if(enrich.ok){
      const j=await enrich.json();
      const p=j?.panchang;
      if(p){
        base.rashi=p.signs?.moon?.name||base.rashi;
      }
    }
  }catch(e){
    console.warn("Panchang enrichment unavailable",e);
  }

  return base;
}

function telugu(data){
  const t={
    Pratipada:"పాడ్యమి",Dvitiiya:"విదియ",Dvitiya:"విదియ",Tritiya:"తదియ",
    Chaturthi:"చవితి",Panchami:"పంచమి",Shashthi:"షష్ఠి",Saptami:"సప్తమి",
    Ashtami:"అష్టమి",Navami:"నవమి",Dashami:"దశమి",Ekadashi:"ఏకాదశి",
    Dwadashi:"ద్వాదశి",Trayodashi:"త్రయోదశి",Chaturdashi:"చతుర్దశి",
    Purnima:"పౌర్ణమి",Amavasya:"అమావాస్య"
  };
  const phase=data.tithi?.startsWith("Shukla")?"శుక్ల":data.tithi?.startsWith("Krishna")?"కృష్ణ":"";
  const name=(data.tithi||"").replace(/^(Shukla|Krishna)\s+/,"");
  return {
    tithi:(phase+" "+(t[name]||name)).trim(),
    nakshatra:data.nakshatra,
    rashi:data.rashi
  };
}

export default async ()=>{
  const publicKey=Netlify.env.get("VAPID_PUBLIC_KEY");
  const privateKey=Netlify.env.get("VAPID_PRIVATE_KEY");
  const subject=Netlify.env.get("VAPID_SUBJECT")||"https://siddhasankalpa.netlify.app/";
  if(!publicKey||!privateKey)throw new Error("VAPID environment variables are not configured.");

  webpush.setVapidDetails(subject,publicKey,privateKey);

  const store=getStore(STORE_NAME,{consistency:"strong"});
  const {blobs}=await store.list();
  const date=indiaToday();
  let sent=0,removed=0,failed=0;

  for(const blob of blobs){
    const record=await store.get(blob.key,{type:"json"});
    if(!record?.subscription?.endpoint)continue;

    try{
      const p=await getPanchang(record.city||"hyderabad",date);
      const values=record.language==="te"?telugu(p):p;
      const body=[
        "📅 "+date,
        "🌙 Tithi: "+values.tithi,
        "⭐ Nakshatram: "+values.nakshatra,
        "♈ Rashi: "+values.rashi,
        "☀️ Sunrise: "+p.sunrise,
        "🌇 Sunset: "+p.sunset,
        ...(personalStrength(record,p)?[
          "✦ "+(record.language==="te"?"తారాబలం":"Tarabalam")+": "+personalStrength(record,p).taraText,
          "☾ "+(record.language==="te"?"చంద్రబలం":"Chandrabalam")+": "+personalStrength(record,p).chandraText
        ]:[])
      ].join("\n");

      await webpush.sendNotification(record.subscription,JSON.stringify({
        title:"🔔 Siddha Astro — Today's Panchangam",
        body,
        icon:"/logo.png",
        badge:"/logo.png",
        url:"/panchangam.html"
      }));
      sent++;
    }catch(error){
      failed++;
      const status=error?.statusCode;
      if(status===404||status===410){
        await store.delete(blob.key);
        removed++;
      }else{
        console.error("Push failed",blob.key,error);
      }
    }
  }

  return new Response(JSON.stringify({ok:true,date,sent,removed,failed}),{
    headers:{"Content-Type":"application/json"}
  });
};

export const config={schedule:"30 0 * * *"};
