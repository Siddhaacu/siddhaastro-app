export default async (req) => {
  const url=new URL(req.url);
  const date=url.searchParams.get("date");
  const city=url.searchParams.get("city")||"hyderabad";
  if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)||!city)return new Response(JSON.stringify({error:"Invalid date or city"}),{status:400,headers:{"Content-Type":"application/json"}});
  const prevDate=(()=>{const p=date.split("-").map(Number);const d=new Date(Date.UTC(p[0],p[1]-1,p[2]-1));return d.toISOString().slice(0,10)})();
  const page=async d=>{const r=await fetch("https://shastrapanchangam.com/en/panchangam/"+city+"/"+d+"/");if(!r.ok)throw new Error("HTTP "+r.status);return cleanText(await r.text());};
  try{
    const [today,prev]=await Promise.all([page(date),page(prevDate)]);
    const te=extractEnd(today,"Tithi"),ne=extractEnd(today,"Nakshatra");
    const pe=extractEnd(prev,"Tithi"),pn=extractEnd(prev,"Nakshatra");
    return new Response(JSON.stringify({tithiTiming:formatRange(pe,te),nakshatraTiming:formatRange(pn,ne),timingSource:"Shastra Panchangam"}),{headers:{"Content-Type":"application/json","Cache-Control":"public,max-age=3600"}});
  }catch(e){return new Response(JSON.stringify({error:"Unable to load transition timings"}),{status:502,headers:{"Content-Type":"application/json"}});}
};

function cleanText(html){return html.replace(/<script[\\s\\S]*?<\\/script>/gi," ").replace(/<style[\\s\\S]*?<\\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&middot;/gi,"·").replace(/\\s+/g," ").trim();}
function extractEnd(text,kind){const re=new RegExp(kind+"\\\\s*[·:.-]?\\\\s*[^.]{0,100}?\\\\s+until\\\\s+(\\\\d{1,2}:\\\\d{2}\\\\s*(?:am|pm))(?:\\\\s+(?:next|the)\\\\s+day)?","i");const m=text.match(re);return m?m[1].replace(/\\\\s+/g," ").toUpperCase():null;}
function formatRange(start,end){return end?(start?start+" – ":"")+end:"";}
function cleanText(html){
  return html.replace(/<script[\\s\\S]*?<\\/script>/gi," ").replace(/<style[\\s\\S]*?<\\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&middot;/gi,"·").replace(/\\s+/g," ").trim();
}
function extractEnd(text,kind){
  const re=new RegExp(kind+"\\s*[·:.-]?\\s*[^.]{0,100}?\\s+until\\s+(\\d{1,2}:\\d{2}\\s*(?:am|pm))(?:\\s+(?:next|the)\\s+day)?","i");
  const m=text.match(re);
  return m?m[1].replace(/\\s+/g," ").toUpperCase():null;
}
function toMinutes(time){
  const m=String(time||"").match(/(\\d{1,2}):(\\d{2})\\s*(AM|PM)/i);
  if(!m)return null;
  let h=Number(m[1]),min=Number(m[2]);const ap=m[3].toUpperCase();
  if(ap==="PM"&&h<12)h+=12;if(ap==="AM"&&h===12)h=0;
  return h*60+min;
}
function formatRange(start,end){
  if(!end)return "";
  return start?start+" – "+end:end;
}
async function transitionProxy(dateStr,city){
  try{
    const r=await fetch("/.netlify/functions/panchang-transition?date="+encodeURIComponent(dateStr)+"&city="+encodeURIComponent(city.slug||"hyderabad"),{headers:{Accept:"application/json"}});
    if(r.ok){
      const j=await r.json();
      if(j?.tithiTiming||j?.nakshatraTiming)return j;
    }
  }catch(e){console.warn("Transition proxy unavailable",e);}
  return {};
}
async function fetchTransitionTimings(dateStr,city){
  const proxy=await transitionProxy(dateStr,city);
  if(proxy.tithiTiming||proxy.nakshatraTiming)return proxy;
  return {};
}