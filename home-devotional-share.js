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
    activeShareMode="devotional";
    const heading=modal.querySelector(".devotional-share-sheet h3");if(heading)heading.hidden=false;
    if(meaningEl)meaningEl.hidden=false;
    const divider=modal.querySelector(".devotional-share-divider");if(divider)divider.hidden=false;
    modal.hidden=true;
    document.body.classList.remove("devotional-modal-open");
    document.querySelector("[data-devotional-open]")?.focus();
  };
  const copyText=async text=>{
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true;}
    const area=document.createElement("textarea");area.value=text;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();
    const ok=document.execCommand("copy");area.remove();return ok;
  };
  let activeShareMode="devotional";
  const panchangamRows=()=>{
    const labels={vara:"Vara",thithi:"Tithi",nakshatra:"Nakshatra",rashi:"Rashi",yoga:"Yoga",sunrise:"Sunrise",sunset:"Sunset",rahuKalam:"Rahu Kalam",yamagandam:"Yamagandam",tithiTiming:"Tithi timing",nakshatraTiming:"Nakshatra timing"};
    return Object.entries(labels).map(([key,label])=>{const value=document.querySelector('[data-p="'+key+'"]')?.textContent?.trim();return value&&value!=="—"?[label,value]:null;}).filter(Boolean);
  };
  const panchangamShareText=()=>{const date=document.getElementById("homeDate")?.textContent?.trim()||"Today";return ["Today\'s Panchangam — "+date,...panchangamRows().map(([label,value])=>label+": "+value),"Siddha Astro — "+location.origin].join("\n");};
  const openPanchangamModal=()=>{
    if(!modal)return;activeShareMode="panchangam";
    const date=document.getElementById("homeDate")?.textContent?.trim()||"Today";
    const modalTitle=modal.querySelector("#devotionalShareTitle");if(modalTitle)modalTitle.textContent="Today\'s Panchangam";
    if(titleEl)titleEl.textContent=date;
    if(verseEl)verseEl.textContent=panchangamRows().map(([label,value])=>label+"  •  "+value).join("\n");
    const heading=modal.querySelector(".devotional-share-sheet h3");if(heading)heading.hidden=true;
    if(meaningEl){meaningEl.hidden=true;meaningEl.textContent="";}
    const divider=modal.querySelector(".devotional-share-divider");if(divider)divider.hidden=true;
    modal.hidden=false;document.body.classList.add("devotional-modal-open");modal.querySelector("[data-devotional-close]")?.focus();
  };
  const sharePanchangamImage=async()=>{
    const rows=panchangamRows(),date=document.getElementById("homeDate")?.textContent?.trim()||"Today";
    const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=Math.max(1200,430+rows.length*76+120);
    const ctx=canvas.getContext("2d");const bg=ctx.createLinearGradient(0,0,1080,canvas.height);bg.addColorStop(0,"#fffdf6");bg.addColorStop(1,"#edf5ef");ctx.fillStyle=bg;ctx.fillRect(0,0,1080,canvas.height);
    ctx.strokeStyle="#dfe7e1";ctx.lineWidth=5;ctx.strokeRect(28,28,1024,canvas.height-56);
    ctx.textAlign="center";ctx.fillStyle="#a27a2a";ctx.font="800 38px Arial";ctx.fillText("SIDDHA ASTRO",540,112);
    ctx.fillStyle="#26332f";ctx.font="800 58px Arial";ctx.fillText("Today\'s Panchangam",540,210);
    ctx.fillStyle="#68766f";ctx.font="32px Arial";ctx.fillText(date,540,270);
    const top=345,left=110,right=970,rowH=76;rows.forEach(([label,value],i)=>{const y=top+i*rowH;ctx.fillStyle=i%2===0?"rgba(255,255,255,.76)":"rgba(229,239,233,.72)";ctx.fillRect(left,y,right-left,64);ctx.textAlign="left";ctx.fillStyle="#4f7567";ctx.font="700 27px Arial";ctx.fillText(label,left+24,y+42);ctx.textAlign="right";ctx.fillStyle="#26332f";ctx.font="600 27px Arial";ctx.fillText(value,right-24,y+42);});
    ctx.textAlign="center";ctx.fillStyle="#a27a2a";ctx.font="700 25px Arial";ctx.fillText("Vedic wisdom for modern life  •  "+location.origin,540,canvas.height-78);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));if(!blob)throw new Error("Could not create Panchangam image.");
    const file=new File([blob],"siddha-astro-panchangam.png",{type:"image/png"});
    if(navigator.canShare?.({files:[file]})&&navigator.share){await navigator.share({title:"Today\'s Panchangam",files:[file]});return;}
    const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
  };
  document.addEventListener("click",async event=>{
    const panchangamButton=event.target.closest("[data-home-panchang-share]");
    if(panchangamButton){openPanchangamModal();return;}
    if(event.target.closest("[data-devotional-open]")){openModal();return;}
    if(event.target.closest("[data-devotional-close]")){closeModal();return;}
    const button=event.target.closest("[data-devotional-share]");
    if(!button)return;
    const text=activeShareMode==="panchangam"?panchangamShareText():shareText(),kind=button.dataset.devotionalShare;
    if(kind==="whatsapp"){
      window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank","noopener,noreferrer");
      return;
    }
    if(kind==="instagram"){
      try{
        if(activeShareMode==="panchangam"){await sharePanchangamImage();}else if(navigator.share){await navigator.share({title:"Daily devotional reading",text,url:location.href});}
        else{await copyText(text);window.open("https://www.instagram.com/","_blank","noopener,noreferrer");}
      }catch(error){if(error?.name!=="AbortError")try{await copyText(text);button.title="Reading copied — paste it into Instagram";}catch(_){}}
      return;
    }
    try{
      if(activeShareMode==="panchangam"){await sharePanchangamImage();}
      else if(navigator.share){await navigator.share({title:"Daily devotional reading",text,url:location.href});}
      else{await copyText(text);button.title="Reading copied to clipboard";}
    }catch(error){if(error?.name!=="AbortError")try{await copyText(text);button.title="Reading copied to clipboard";}catch(_){}}
  });
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&modal&&!modal.hidden)closeModal();});
})();
