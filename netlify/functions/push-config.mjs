export default async ()=>{
  const publicKey=Netlify.env.get("VAPID_PUBLIC_KEY");
  if(!publicKey){
    return new Response(JSON.stringify({configured:false}),{
      status:503,
      headers:{"Content-Type":"application/json"}
    });
  }
  return new Response(JSON.stringify({configured:true,publicKey}),{
    headers:{"Content-Type":"application/json","Cache-Control":"no-store"}
  });
};
