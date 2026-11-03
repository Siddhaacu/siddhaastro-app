/* Siddha Astro — share the daily devotional reading */
(()=>{
  const shareText=()=>{
    const title=document.querySelector(".sloka h2")?.textContent?.trim()||"Daily devotional reading";
    const number=document.getElementById("slokaNumber")?.textContent?.trim()||"";
    const verse=document.getElementById("slokaTelugu")?.textContent?.trim()||"";
    const note=document.querySelector(".sloka-note")?.textContent?.trim()||"";
    return [title,number,verse,note,"Siddha Astro — "+location.origin].filter(Boolean).join("\n\n");
  };
  const copyText=async text=>{
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true;}
    const area=document.createElement("textarea");area.value=text;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();
    const ok=document.execCommand("copy");area.remove();return ok;
  };
  document.addEventListener("click",async event=>{
    const button=event.target.closest("[data-devotional-share]");
    if(!button)return;
    const text=shareText(),kind=button.dataset.devotionalShare;
    if(kind==="whatsapp"){
      window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank","noopener,noreferrer");
      return;
    }
    if(kind==="instagram"){
      try{
        if(navigator.share){await navigator.share({title:"Daily devotional reading",text,url:location.href});}
        else{await copyText(text);window.open("https://www.instagram.com/","_blank","noopener,noreferrer");}
      }catch(error){if(error?.name!=="AbortError")try{await copyText(text);button.title="Reading copied — paste it into Instagram";}catch(_){}}
      return;
    }
    try{
      if(navigator.share){await navigator.share({title:"Daily devotional reading",text,url:location.href});}
      else{await copyText(text);button.title="Reading copied to clipboard";}
    }catch(error){if(error?.name!=="AbortError")try{await copyText(text);button.title="Reading copied to clipboard";}catch(_){}}
  });
})();
