/* Daily Siddha Astro WhatsApp Status image */
(()=> {
  const $=id=>document.getElementById(id);
  let imageBlob=null;
  const dateKey=()=>SiddhaPanchangam.indiaToday();
  const displayDate=key=>new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date(key+"T12:00:00+05:30"));
  const language=()=>localStorage.getItem("siddha-language")==="te"?"te":"en";
  const city=()=>localStorage.getItem("siddha-panchang-city")||"hyderabad";
  const clean=v=>String(v??"—").trim()||"—";
  const wrap=(ctx,text,x,y,maxWidth,lineHeight,maxLines=4)=>{
    const words=String(text||"").split(/\s+/);let line="",lines=0;
    for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>maxWidth&&line){ctx.fillText(line,x,y);y+=lineHeight;line=word;if(++lines>=maxLines)return y;}else line=test;}
    if(line&&lines<maxLines){ctx.fillText(line,x,y);y+=lineHeight;}
    return y;
  };
  const loadImage=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});
  async function build(){
    const lang=language(),key=dateKey(),p=await SiddhaPanchangam.fetchPanchangam(key,city());
    const val=(k,v)=>SiddhaPanchangam.translateValue(k,v)||clean(v);
    const labels=lang==="te"
      ?{title:"ఈ రోజు పంచాంగం",vara:"వారం",thithi:"తిథి",nakshatra:"నక్షత్రం",rashi:"రాశి",yoga:"యోగం",sunrise:"సూర్యోదయం",sunset:"సూర్యాస్తమయం",sloka:"నేటి భక్తి శ్లోకం"}
      :{title:"TODAY'S PANCHANGAM",vara:"Vara",thithi:"Tithi",nakshatra:"Nakshatra",rashi:"Rashi",yoga:"Yoga",sunrise:"Sunrise",sunset:"Sunset",sloka:"TODAY'S DEVOTIONAL VERSE"};
    const verseData=typeof getTodayVishnuSloka==="function"?getTodayVishnuSloka():null;
    let verse=verseData?.text||"శ్రీ విష్ణు సహస్రనామమ్";
    if(lang==="en"&&typeof transliterateTelugu==="function")verse=transliterateTelugu(verse);
    const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1920;
    const ctx=canvas.getContext("2d");
    const grad=ctx.createLinearGradient(0,0,1080,1920);grad.addColorStop(0,"#101b18");grad.addColorStop(.55,"#1d3028");grad.addColorStop(1,"#0d1714");
    ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1920);
    ctx.strokeStyle="#c5a35b";ctx.lineWidth=4;ctx.strokeRect(34,34,1012,1852);
    ctx.strokeStyle="rgba(224,194,125,.38)";ctx.lineWidth=1;ctx.strokeRect(54,54,972,1812);
    const logo=await loadImage("/logo.png");
    ctx.save();ctx.beginPath();ctx.arc(540,205,104,0,Math.PI*2);ctx.clip();ctx.drawImage(logo,436,101,208,208);ctx.restore();
    ctx.textAlign="center";ctx.fillStyle="#e5c77f";ctx.font="700 38px Arial";ctx.fillText("SIDDHA ASTRO",540,365);
    ctx.fillStyle="#fff8e8";ctx.font="700 54px Arial";ctx.fillText(labels.title,540,465);
    ctx.fillStyle="#d8c9a5";ctx.font="30px Arial";ctx.fillText(displayDate(key),540,525);
    ctx.fillStyle="#c6a55e";ctx.fillRect(150,570,780,3);
    const rows=[
      [labels.vara,val("vara",p.vara)],
      [labels.thithi,val("thithi",p.thithi)],
      [labels.nakshatra,val("nakshatra",p.nakshatra)],
      [labels.rashi,val("rashi",p.rashi)],
      [labels.yoga,val("yoga",p.yoga)],
      [labels.sunrise,clean(p.sunrise)],
      [labels.sunset,clean(p.sunset)]
    ];
    let y=630;
    for(let i=0;i<rows.length;i++){
      ctx.fillStyle=i%2?"rgba(255,255,255,.045)":"rgba(255,255,255,.085)";
      ctx.beginPath();ctx.roundRect(110,y,860,78,14);ctx.fill();
      ctx.textAlign="left";ctx.fillStyle="#d8bd79";ctx.font="600 27px Arial";ctx.fillText(rows[i][0],145,y+49);
      ctx.textAlign="right";ctx.fillStyle="#fff9eb";ctx.font="600 29px Arial";ctx.fillText(rows[i][1],935,y+49);
      y+=91;
    }
    y+=22;ctx.textAlign="center";ctx.fillStyle="#e5c77f";ctx.font="700 30px Arial";ctx.fillText(labels.sloka,540,y);y+=52;
    ctx.fillStyle="#fff8e8";ctx.font=lang==="te"?"34px 'Noto Sans Telugu',sans-serif":"32px Georgia,serif";
    y=wrap(ctx,verse,540,y,820,55,6);
    ctx.fillStyle="#d8c9a5";ctx.font="26px Arial";ctx.textAlign="center";
    ctx.fillText("Vedic wisdom for modern life",540,1790);
    ctx.fillStyle="#e5c77f";ctx.font="700 27px Arial";ctx.fillText("app.siddhaastro.in",540,1830);
    imageBlob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
    if(!imageBlob)throw new Error("Unable to create the status image.");
    $("statusPreview").src=URL.createObjectURL(imageBlob);
    $("statusLoading").hidden=true;$("statusShare").disabled=false;$("statusDownload").disabled=false;
  }
  $("statusShare").addEventListener("click",async()=>{
    if(!imageBlob)return;
    const file=new File([imageBlob],"siddha-astro-daily-status.png",{type:"image/png"});
    try{
      if(navigator.canShare?.({files:[file]})&&navigator.share)await navigator.share({title:"Siddha Astro Daily Panchangam",files:[file]});
      else download();
    }catch(error){if(error?.name!=="AbortError")$("statusError").textContent="Sharing was not available. Please download the image and upload it to WhatsApp Status.";}
  });
  function download(){
    if(!imageBlob)return;const url=URL.createObjectURL(imageBlob),a=document.createElement("a");a.href=url;a.download="siddha-astro-daily-status.png";a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  $("statusDownload").addEventListener("click",download);
  build().catch(error=>{$("statusLoading").textContent="Today's status image could not be prepared. Please try again."; $("statusError").textContent=error?.message||"Please try again later.";});
})();
