import { getStore } from "@netlify/blobs";

const STORE_NAME="siddha-astro-horoscope";
const PANCHANG_API="https://nityapanchangam.com/api/panchangam.php";

const RASHIS=[
  ["Mesha","Aries","♈","Fire","Mars"],["Vrishabha","Taurus","♉","Earth","Venus"],
  ["Mithuna","Gemini","♊","Air","Mercury"],["Karkataka","Cancer","♋","Water","Moon"],
  ["Simha","Leo","♌","Fire","Sun"],["Kanya","Virgo","♍","Earth","Mercury"],
  ["Tula","Libra","♎","Air","Venus"],["Vrischika","Scorpio","♏","Water","Mars"],
  ["Dhanu","Sagittarius","♐","Fire","Jupiter"],["Makara","Capricorn","♑","Earth","Saturn"],
  ["Kumbha","Aquarius","♒","Air","Saturn"],["Meena","Pisces","♓","Water","Jupiter"]
];

const CITY={slug:"hyderabad"};
const FOCUS=["fresh beginnings","steady progress","clear communication","emotional balance","creative confidence","careful planning","partnerships","deep transformation","expansion","discipline","new ideas","spiritual clarity"];
const CAREER=["A practical opportunity can move work forward.","Keep priorities focused and avoid unnecessary delays.","A useful conversation can open a new professional path.","Your judgement improves when you give decisions enough time.","Your creative approach can attract recognition.","Detailed work done today can prevent future rework.","Cooperation with colleagues brings better results.","Research and persistence reveal an important advantage.","A broader outlook helps you spot growth opportunities.","Consistent effort is more valuable than a quick result.","An unconventional solution may solve a stubborn problem.","Intuition and thoughtful planning work well together."];
const LOVE=["Speak openly and avoid assuming what others feel.","Small acts of reliability strengthen close relationships.","A meaningful conversation can improve emotional understanding.","Give yourself and others room to process feelings.","Warmth and confidence make connections easier.","Thoughtful attention matters more than grand gestures.","Balance your needs with the needs of the relationship.","Honesty helps deepen an important bond.","Shared experiences bring freshness to relationships.","Commitment grows through consistency.","Friendship and understanding can become the strongest foundation.","Compassion makes today especially supportive for relationships."];
const HEALTH=["Maintain a steady routine and avoid overexertion.","Good sleep and regular meals support your energy.","A short break from screens can improve mental clarity.","Give yourself time to relax and reset.","Physical activity can channel excess energy constructively.","Keep routines simple and consistent.","Balance work with enough recovery time.","Quiet time or meditation can be restorative.","Outdoor activity can lift your mood and energy.","Consistency with healthy habits pays off.","Avoid mental overload and make space for rest.","Calm breathing and gentle movement can restore balance."];

const indiaToday=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const dayNumber=date=>Math.floor(Date.parse(date+"T00:00:00Z")/86400000);

async function getPanchang(date){
  const q=new URLSearchParams({date,city:CITY.slug});
  const r=await fetch(PANCHANG_API+"?"+q,{headers:{Accept:"application/json"}});
  if(!r.ok) throw new Error("Panchang API HTTP "+r.status);
  const d=await r.json();
  return {
    tithi:d.tithi?.name||"the day's Tithi",
    nakshatra:d.nakshatra?.name||"the day's Nakshatra",
    rashi:d.rashi?.name||"the Moon's Rashi",
    sunrise:d.sun?.sunrise||d.sunrise||"—",
    sunset:d.sun?.sunset||d.sunset||"—"
  };
}

function buildHoroscopes(date,p){
  const n=dayNumber(date);
  const result={};
  RASHIS.forEach((r,i)=>{
    const f=FOCUS[(n+i)%FOCUS.length];
    result[r[0]]={
      rashi:r[0],icon:r[2],element:r[3],ruler:r[4],period:r[1],
      daily:`Today emphasizes ${f}. The Moon is in ${p.rashi}, under ${p.nakshatra}, and the day's Tithi is ${p.tithi}. Use this atmosphere thoughtfully and focus on practical action.`,
      career:CAREER[(n+i)%CAREER.length],
      love:LOVE[(n+i*2)%LOVE.length],
      health:HEALTH[(n+i*3)%HEALTH.length],
      lucky:{
        number:String(((n+i)%9)+1),
        day:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][(n+i)%7],
        focus:f
      }
    };
  });
  return result;
}

async function generateToday(store,date){
  const p=await getPanchang(date);
  const data={ok:true,date,generatedAt:new Date().toISOString(),panchang:p,horoscopes:buildHoroscopes(date,p)};
  await store.setJSON(date,data);
  await store.setJSON("latest",data);
  console.log("Daily horoscope generated on demand:",date);
  return data;
}

export default async function(request){
  if(request.method!=="GET") return Response.json({error:"Method not allowed."},{status:405});
  const date=indiaToday();
  const store=getStore(STORE_NAME,{consistency:"strong"});
  let data=await store.get(date,{type:"json"});

  if(!data){
    try{
      data=await generateToday(store,date);
    }catch(error){
      console.error("On-demand horoscope generation failed:",error);
      data=await store.get("latest",{type:"json"});
    }
  }

  if(!data) return Response.json({ok:false,error:"Today's horoscope is being prepared. Please try again shortly."},{status:503});
  return Response.json(data,{headers:{"Cache-Control":"public, max-age=300, stale-while-revalidate=3600"}});
}
