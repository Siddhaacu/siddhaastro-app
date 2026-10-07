import {getStore} from "@netlify/blobs";
import {createHash} from "node:crypto";

const STORE_NAME="siddha-astro-push";
const store=()=>getStore(STORE_NAME,{consistency:"strong"});

function keyFor(endpoint){
  return "sub_"+createHash("sha256").update(endpoint).digest("hex");
}

export default async req=>{
  if(req.method!=="POST"&&req.method!=="DELETE"){
    return new Response(JSON.stringify({error:"Method not allowed"}),{
      status:405,headers:{"Content-Type":"application/json"}
    });
  }

  let payload;
  try{payload=await req.json();}catch(e){
    return new Response(JSON.stringify({error:"Invalid JSON"}),{
      status:400,headers:{"Content-Type":"application/json"}
    });
  }

  if(!payload?.subscription?.endpoint){
    return new Response(JSON.stringify({error:"Push subscription is required"}),{
      status:400,headers:{"Content-Type":"application/json"}
    });
  }

  const key=keyFor(payload.subscription.endpoint);

  if(req.method==="DELETE"){
    await store().delete(key);
    return new Response(JSON.stringify({ok:true}),{
      headers:{"Content-Type":"application/json"}
    });
  }

  await store().setJSON(key,{
    subscription:payload.subscription,
    city:payload.city||"hyderabad",
    language:payload.language==="te"?"te":"en",
    updatedAt:new Date().toISOString()
  });

  return new Response(JSON.stringify({ok:true}),{
    headers:{"Content-Type":"application/json"}
  });
};
