/* Siddha Astro — devotional share preview and sharing actions */
(()=>{
  const modal=document.getElementById("devotionalShareModal");
  const titleEl=document.getElementById("devotionalShareVerseTitle");
  const verseEl=document.getElementById("devotionalShareVerse");
  const meaningEl=document.getElementById("devotionalShareMeaning");
  const slides=[...document.querySelectorAll("[data-devotional-slide]")];
  const dots=[...document.querySelectorAll("[data-devotional-dot]")];
  let activeSlide=0;
  const showSlide=index=>{activeSlide=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.hidden=i!==activeSlide;slide.classList.toggle("active",i===activeSlide);slide.setAttribute("aria-hidden",String(i!==activeSlide));});dots.forEach((dot,i)=>{dot.classList.toggle("active",i===activeSlide);dot.setAttribute("aria-selected",String(i===activeSlide));});};
  dots.forEach(dot=>dot.addEventListener("click",()=>showSlide(Number(dot.dataset.devotionalDot))));
  let touchStartX=0;const slideArea=document.getElementById("devotionalSlides");
  slideArea?.addEventListener("touchstart",event=>{touchStartX=event.changedTouches[0].clientX;},{passive:true});
  slideArea?.addEventListener("touchend",event=>{const dx=event.changedTouches[0].clientX-touchStartX;if(Math.abs(dx)>45)showSlide(activeSlide+(dx<0?1:-1));},{passive:true});
  const renderLalithaScript=()=>{
    const el=document.getElementById("lalithaSlokaTelugu");
    if(!el)return;
    const verse="శ్రీమాతా శ్రీమహారాజ్ఞీ శ్రీమత్సింహాసనేశ్వరీ ।\nచిదగ్నికుణ్డసమ్భూతా దేవకార్యసముద్యతా ॥ ౧ ॥";
    el.textContent=window.SiddhaApp?.getLanguage?.()==="te"?verse:(typeof transliterateTelugu==="function"?transliterateTelugu(verse):verse);
  };
  renderLalithaScript();
  document.addEventListener("languagechange",renderLalithaScript);
  showSlide(0);
  const reading=()=>{
    const language=window.SiddhaApp?.getLanguage?.()==="te"?"te":"en";
    const isLalitha=activeSlide===1;
    const title=isLalitha?(language==="te"?"శ్రీ లలితా సహస్రనామ స్తోత్రం":"Sri Lalitha Sahasranamam"):(language==="te"?"శ్రీ విష్ణు సహస్రనామమ్":"Sri Vishnu Sahasranamam");
    const number=isLalitha?(language==="te"?"శ్లోకం 1 / 182":"Sloka 1 of 182"):(document.getElementById("slokaNumber")?.textContent?.trim()||"");
    const verse=isLalitha?document.getElementById("lalithaSlokaTelugu")?.textContent?.trim():document.getElementById("slokaTelugu")?.textContent?.trim();
    const meaning=isLalitha?(language==="te"?"శ్రీమాత, మహారాజ్ఞి, సింహాసనాధిష్ఠాత్రి అయిన దేవి, చిదగ్ని కుండం నుండి అవతరించి దేవతల కార్యసిద్ధి కోసం ప్రాకటించింది.":"The Divine Mother, the great sovereign and enthroned Queen, arose from the fire-pit of pure consciousness to fulfil the purpose of the gods."):(language==="te"?"ఈ శ్లోకం శ్రీ విష్ణు సహస్రనామ స్తోత్రంలోని భాగం.":"This verse is part of Sri Vishnu Sahasranamam.");
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
