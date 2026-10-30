const BASE = "https://api.navamsha.in";

function localOffset(timeZone, year, month, day, hours, minutes) {
  try {
    const utc = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" }).formatToParts(utc);
    const v = Object.fromEntries(parts.filter(x=>x.type!=="literal").map(x=>[x.type,x.value]));
    return (Date.UTC(+v.year,+v.month-1,+v.day,+v.hour,+v.minute)-utc.getTime())/3600000;
  } catch { throw new Error("Please select a valid birth place and time zone."); }
}
function birth(value, label) {
  const date = String(value?.date || ""), time = String(value?.time || "");
  const [year,month,day] = date.split("-").map(Number);
  const [hours,minutes] = time.split(":").map(Number);
  const latitude=Number(value?.latitude), longitude=Number(value?.longitude);
  if(!year||!month||!day||!Number.isFinite(hours)||!Number.isFinite(minutes)) throw new Error("Enter a valid birth date and time for the "+label+".");
  if(!Number.isFinite(latitude)||latitude < -90||latitude>90||!Number.isFinite(longitude)||longitude < -180||longitude>180) throw new Error("Select a valid birth place for the "+label+".");
  const timezoneName=String(value?.timezoneName||"");
  if(!timezoneName) throw new Error("Select a birth place with a valid time zone for the "+label+".");
  return {year,month,date:day,hours,minutes,latitude,longitude,timezone:localOffset(timezoneName,year,month,day,hours,minutes)};
}
export default async function handler(request) {
  if(request.method==="OPTIONS") return new Response("",{status:204,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type"}});
  if(request.method!=="POST") return Response.json({ok:false,error:"Method not allowed."},{status:405});
  try {
    if(!process.env.NAVAMSHA_API_KEY) throw new Error("NAVAMSHA_API_KEY is not configured in Netlify.");
    const body=await request.json();
    const bride=birth(body.bride,"bride"), groom=birth(body.groom,"groom");
    const response=await fetch(BASE+"/api/v1/compatibility/ashtakoot",{
      method:"POST",
      headers:{"X-API-Key":process.env.NAVAMSHA_API_KEY,"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify({bride,groom})
    });
    const raw=await response.text(); let data;
    try{data=JSON.parse(raw)}catch{throw new Error("The matching service returned an invalid response.");}
    if(!response.ok||data?.statusCode>=400) throw new Error(data?.message||data?.error||"Unable to calculate marriage matching.");
    const output=data?.output??data;
    if(!Number.isFinite(Number(output?.total_score))||!output?.breakdown) throw new Error("The matching service returned incomplete compatibility results.");
    return Response.json({ok:true,bride:{name:String(body.bride?.name||"").trim(),date:body.bride.date,time:body.bride.time,place:String(body.bride.place||"")},groom:{name:String(body.groom?.name||"").trim(),date:body.groom.date,time:body.groom.time,place:String(body.groom.place||"")},result:output,calculation:{system:"Lahiri sidereal",method:"Ashtakoota / Guna Milan",maximum:36}});
  } catch(error) {
    console.error("Marriage matching error:",error);
    const message=error?.message||"Unable to calculate marriage matching.";
    return Response.json({ok:false,error:message},{status:message.includes("not configured")?503:400});
  }
}
