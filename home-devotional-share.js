/* Siddha Astro — devotional share preview and sharing actions */
(()=>{
  const modal=document.getElementById("devotionalShareModal");
  const titleEl=document.getElementById("devotionalShareVerseTitle");
  const verseEl=document.getElementById("devotionalShareVerse");
  const meaningEl=document.getElementById("devotionalShareMeaning");
  const reading=()=>{
    const title=document.querySelector(".sloka h2")?.textContent?.trim()||"Daily devotional reading";
    const number=document.getElementById("slokaNumber")?.textContent?.trim()||"";
    const verse=document.getElementById("slokaTelugu")?.textContent?.trim()||"";
    const language=window.SiddhaApp?.getLanguage?.()==="te"?"te":"en";
    const meaning=language==="te"
      ?"ఈ శ్లోకం శ్రీ విష్ణు సహస్రనామ స్తోత్రంలోని భాగం. భగవంతుని దివ్య నామాలు, గుణాలు, సర్వవ్యాప్త స్వరూపాన్ని స్మరించుకుంటూ భక్తి మరియు దైవ రక్షణపై విశ్వాసాన్ని పెంపొందించుకోవాలని ఈ పారాయణం సూచిస్తుంది."
      :"This verse is part of Sri Vishnu Sahasranamam, the sacred hymn of the Lord’s thousand names. It invites devotees to contemplate the divine qualities and all-pervading presence of Lord Vishnu, and to place their trust in divine guidance and protection.";
    return {title,number,verse,meaning,language};
  };
  const shareText=()=>{
    const r=reading();
    return [r.title,r.number,r.verse,"Meaning: "+r.meaning,"Siddha Astro — "+location.origin].filter(Boolean).join("\n\n");
  };
  const openModal=()=>{
    if(!modal)return;
    const r=reading();
    if(titleEl)titleEl.textContent=r.title+" · "+r.number;
    if(verseEl)verseEl.textContent=r.verse;
    if(meaningEl)meaningEl.textContent=r.meaning;
    modal.hidden=false;
    document.body.classList.add("devotional-modal-open");
    modal.querySelector("[data-devotional-close]")?.focus();
  };
  const closeModal=()=>{
    if(!modal)return;
    modal.hidden=true;
    document.body.classList.remove("devotional-modal-open");
    document.querySelector("[data-devotional-open]")?.focus();
  };
  const copyText=async text=>{
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true;}
    const area=document.createElement("textarea");area.value=text;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();
    const ok=document.execCommand("copy");area.remove();return ok;
  };
  document.addEventListener("click",async event=>{
    if(event.target.closest("[data-devotional-open]")){openModal();return;}
    if(event.target.closest("[data-devotional-close]")){closeModal();return;}
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
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&modal&&!modal.hidden)closeModal();});
})();
