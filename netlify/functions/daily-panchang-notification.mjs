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
        "🌇 Sunset: "+p.sunset
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
