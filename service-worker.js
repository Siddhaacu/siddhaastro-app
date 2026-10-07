const CACHE_NAME="siddha-astro-v1";

self.addEventListener("install",event=>{
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push",event=>{
  let data={};
  try{data=event.data?event.data.json():{};}catch(e){data={body:event.data?.text()||"Today's Panchangam is ready."};}
  const title=data.title||"Siddha Astro";
  const options={
    body:data.body||"Today's Panchangam is ready.",
    icon:data.icon||"/logo.png",
    badge:data.badge||"/logo.png",
    tag:"daily-panchangam",
    renotify:true,
    data:{url:data.url||"/panchangam.html"}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const target=event.notification.data?.url||"/panchangam.html";
  event.waitUntil((async()=>{
    const list=await clients.matchAll({type:"window",includeUncontrolled:true});
    for(const client of list){
      try{
        if("focus" in client){
          await client.focus();
          if("navigate" in client) await client.navigate(target);
          return;
        }
      }catch(e){}
    }
    if(clients.openWindow) await clients.openWindow(target);
  })());
});
