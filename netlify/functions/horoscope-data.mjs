import { getStore } from "@netlify/blobs";

const STORE_NAME="siddha-astro-horoscope";
const indiaToday=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

export default async function(request){
  if(request.method!=="GET") return Response.json({error:"Method not allowed."},{status:405});
  const date=indiaToday();
  const store=getStore(STORE_NAME,{consistency:"strong"});
  let data=await store.get(date,{type:"json"});
  if(!data) data=await store.get("latest",{type:"json"});
  if(!data) return Response.json({ok:false,error:"Today's horoscope is being prepared. Please try again shortly."},{status:503});
  return Response.json(data,{headers:{"Cache-Control":"public, max-age=300, stale-while-revalidate=3600"}});
}
