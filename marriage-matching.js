(()=>{
"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"—").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const disclaimer="Astrology consultations, mantras, spiritual remedies, rituals, prayers, and related services do not guarantee any specific results. Outcomes and experiences vary from person to person and depend on individual circumstances. By using these services, you acknowledge that results are uncertain and cannot be assured.";
const note="This is a computer-generated report. Please consult a qualified astrologer for accurate interpretation and guidance after reviewing the match results.";
const people=["bride","groom"];
function setupPerson(person){
 const input=$(person+"PlaceSearch"),list=$(person+"PlaceSuggestions"),status=$(person+"PlaceStatus");
 let timer,controller;
 const close=()=>{list.classList.remove("open");list.innerHTML=""};
 const choose=p=>{
  const label=[p.name,p.admin1,p.country].filter(Boolean).join(", ");
  input.value=label;$(person+"Place").value=label;
  $(person+"Latitude").value=p.latitude;$(person+"Longitude").value=p.longitude;$(person+"Timezone").value=p.timezone||"";
  status.textContent="📍 "+label;close();
 };
 const search=async()=>{
  const q=input.value.trim();if(q.length<2){close();return}
  controller?.abort();controller=new AbortController();list.innerHTML='<div class="place-searching">Searching worldwide…</div>';list.classList.add("open");
  try{
   const r=await fetch("https://geocoding-api.open-meteo.com/v1/search?name="+encodeURIComponent(q)+"&count=6&language=en&format=json",{signal:controller.signal});
   if(!r.ok)throw new Error();const data=await r.json(),rows=(data.results||[]).filter(x=>Number.isFinite(+x.latitude)&&Number.isFinite(+x.longitude));
   if(!rows.length){list.innerHTML='<div class="place-empty">No matching place found. Try a nearby town or city.</div>';return}
   list.innerHTML=rows.map((p,i)=>'<button type="button" class="place-option" data-i="'+i+'"><strong>'+esc(p.name)+'</strong><span>'+esc([p.admin1,p.country].filter(Boolean).join(", "))+(p.timezone?" • "+esc(p.timezone):"")+'</span></button>').join("");
   list.querySelectorAll("[data-i]").forEach((b,i)=>b.addEventListener("click",()=>choose(rows[i])));
  }catch(e){if(e.name!=="AbortError")list.innerHTML='<div class="place-empty">Location search is unavailable. Please try again.</div>'}
 };
 input.addEventListener("input",()=>{$(person+"Place").value="";$(person+"Latitude").value="";$(person+"Longitude").value="";$(person+"Timezone").value="";status.textContent="Select a location from search results";clearTimeout(timer);timer=setTimeout(search,350)});
 input.addEventListener("focus",()=>{if(input.value.trim().length>1)search()});
 input.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
 document.addEventListener("click",e=>{if(!e.target.closest("#"+person+"PlaceWrap"))close()});
}
function field(person,label){
 const p=person==="bride"?"Bride":"Groom";
 return '<section class="card match-person"><div class="section-head"><div><h3>'+p+' details</h3><p>Enter accurate birth information</p></div></div><div class="form-grid"><div class="field"><label for="'+person+'Name">Name</label><input id="'+person+'Name" type="text" autocomplete="name" placeholder="'+p+' name"></div><div class="field"><label for="'+person+'Date">Birth date</label><input id="'+person+'Date" type="date" required></div><div class="field"><label for="'+person+'Time">Birth time</label><input id="'+person+'Time" type="time" value="12:00" required></div><div class="field birth-place-field"><label for="'+person+'PlaceSearch">Place of birth</label><div class="birth-place-wrap" id="'+person+'PlaceWrap"><input id="'+person+'PlaceSearch" class="birth-place-input" type="search" autocomplete="off" placeholder="Search city, town or village worldwide"><div id="'+person+'PlaceSuggestions" class="place-suggestions" role="listbox"></div></div><span id="'+person+'PlaceStatus" class="place-status">Select a birth place</span><input id="'+person+'Place" type="hidden"><input id="'+person+'Latitude" type="hidden"><input id="'+person+'Longitude" type="hidden"><input id="'+person+'Timezone" type="hidden"></div></div></section>';
}
function personPayload(person){
 return {name:$(person+"Name").value.trim(),date:$(person+"Date").value,time:$(person+"Time").value,place:$(person+"Place").value,latitude:Number($(person+"Latitude").value),longitude:Number($(person+"Longitude").value),timezoneName:$(person+"Timezone").value};
}
function scoreLabel(score){return score>=24?"Traditionally considered a strong score":score>=18?"Traditionally meets the common minimum threshold":"Below the commonly cited traditional threshold"}
function render(data){
 const r=data.result, breakdown=r.breakdown||{};
 const rows=Object.entries(breakdown).map(([key,v])=>'<tr><td><strong>'+esc(key.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()))+'</strong></td><td>'+esc(v.score??"—")+'</td><td>'+esc(v.maximum??"—")+'</td><td>'+esc(v.source_rule??"—")+'</td></tr>').join("");
 const score=Number(r.total_score),max=Number(r.maximum_score||36);
 $("marriageResults").innerHTML='<div class="section-head"><div><h2>Marriage Matching Results</h2><p>Ashtakoota • Guna Milan</p></div><span class="api-badge">Calculated</span></div><div class="match-score"><strong>'+esc(score)+' / '+esc(max)+'</strong><span>'+esc(scoreLabel(score))+'</span></div><div class="match-pair"><div class="tile"><div class="tile-label">Bride</div><div class="tile-value">'+esc(data.bride.name||"Bride")+'</div><small>'+esc(r.bride?.nakshatra?.name||r.bride?.nakshatra||"—")+' • '+esc(r.bride?.sign||"—")+'</small></div><div class="tile"><div class="tile-label">Groom</div><div class="tile-value">'+esc(data.groom.name||"Groom")+'</div><small>'+esc(r.groom?.nakshatra?.name||r.groom?.nakshatra||"—")+' • '+esc(r.groom?.sign||"—")+'</small></div></div><h3>Ashta Koota breakdown</h3><div class="table-scroll"><table class="kundali-table"><thead><tr><th>Koota</th><th>Score</th><th>Max</th><th>Rule</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="calculation-note"><strong>Important:</strong> '+esc(note)+' This score is a traditional astrological indicator, not a prediction or guarantee of marital happiness. Regional traditions and astrologers may interpret factors differently.</div><div class="actions pdf-actions"><button class="btn btn-primary" id="downloadMatchPdf">Download Marriage Matching PDF</button></div>';
 $("downloadMatchPdf").addEventListener("click",()=>downloadPdf(data));
 $("marriageResults").scrollIntoView({behavior:"smooth",block:"start"});
}
async function calculate(){
 const bride=personPayload("bride"),groom=personPayload("groom"),box=$("marriageResults"),btn=$("matchCalculateBtn");
 for(const [label,p] of [["Bride",bride],["Groom",groom]]){
  if(!p.name||!p.date||!p.time||!p.place||!p.timezoneName||!Number.isFinite(p.latitude)||!Number.isFinite(p.longitude)){
   box.innerHTML='<div class="message error">Please complete all '+label.toLowerCase()+' details and select a birth place from the worldwide search results.</div>';return;
  }
 }
 btn.disabled=true;btn.textContent="Calculating…";
 box.innerHTML='<div class="loading-card"><div class="spinner"></div><strong>Calculating marriage compatibility…</strong><span>Comparing both birth charts using the 36-point Ashtakoota method.</span></div>';
 try{
  const response=await fetch("/.netlify/functions/marriage-matching",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bride,groom})});
  const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||"Unable to calculate matching.");
  window.SiddhaMarriageMatch.lastData=data;render(data);
 }catch(e){box.innerHTML='<div class="message error"><strong>Could not generate marriage matching.</strong><br>'+esc(e.message)+'</div>'}
 finally{btn.disabled=false;btn.textContent="Generate Marriage Matching"}
}
async function downloadPdf(data){
 if(!window.jspdf?.jsPDF){alert("PDF generator is still loading. Please try again.");return}
 const {jsPDF}=window.jspdf,doc=new jsPDF({unit:"mm",format:"a4"}),m=14,W=210,H=297;
 const ink=[38,51,47],muted=[100,115,108],accent=[54,89,77],line=[220,229,222];
 const text=(v,x,y,size=8,bold=false,color=ink)=>{doc.setFont("helvetica",bold?"bold":"normal");doc.setFontSize(size);doc.setTextColor(...color);doc.text(String(v??"—"),x,y)};
 const section=(title,y)=>{text(title,m,y,12,true);doc.setDrawColor(...line);doc.line(m,y+2,W-m,y+2);return y+10};
 const wrap=(v,w)=>doc.splitTextToSize(String(v??"—"),w);
 const footer=()=>{doc.setDrawColor(...line);doc.line(m,H-32,W-m,H-32);doc.setFont("helvetica","normal");doc.setFontSize(5.4);doc.setTextColor(...muted);doc.text(wrap(disclaimer,W-2*m),m,H-28,{lineHeightFactor:1.0});text("Siddha Astro • Page "+doc.getNumberOfPages(),m,H-6,6,false,muted);text("Marriage Matching Report",W-m,H-6,6,false,muted)};
 try{const r=await fetch("/logo.png");if(r.ok){const b=await r.blob(),img=await new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(f.result);f.onerror=rej;f.readAsDataURL(b)});doc.addImage(img,"PNG",m,8,17,17)}}catch{}
 text("Siddha Astro",35,16,19,true,accent);text("Marriage Compatibility • Ashtakoota Guna Milan",35,23,8,false,muted);text("Computer-generated compatibility report",35,29,8,true,accent);
 let y=section("Birth Details",39);
 const rows=[["Bride",data.bride.name||"Bride",data.bride.date,data.bride.time,data.bride.place],["Groom",data.groom.name||"Groom",data.groom.date,data.groom.time,data.groom.place]];
 const widths=[24,42,35,25,56],headers=["Role","Name","Birth date","Birth time","Birth place"];
 doc.setFillColor(235,242,237);doc.rect(m,y-4,widths.reduce((a,b)=>a+b,0),8,"F");let x=m;headers.forEach((h,i)=>{text(h,x,y,6.5,true,accent);x+=widths[i]});y+=9;
 rows.forEach(row=>{x=m;row.forEach((v,i)=>{doc.setFont("helvetica","normal");doc.setFontSize(6.5);doc.setTextColor(...ink);doc.text(wrap(v,widths[i]-2).slice(0,2),x,y);x+=widths[i]});doc.setDrawColor(...line);doc.line(m,y+3,W-m,y+3);y+=10});
 y+=7;y=section("Ashtakoota Guna Milan Score",y);
 const result=data.result,score=Number(result.total_score),max=Number(result.maximum_score||36);
 text(score+" / "+max,m,y+3,23,true,accent);text(score>=24?"Traditionally considered a strong score":score>=18?"Traditionally meets the common minimum threshold":"Below the commonly cited traditional threshold",m+48,y,8,true,muted);y+=16;
 const rows2=Object.entries(result.breakdown||{}),cw=[48,28,28,82];
 doc.setFillColor(235,242,237);doc.rect(m,y-4,cw.reduce((a,b)=>a+b,0),8,"F");x=m;["Koota","Score","Maximum","Source rule"].forEach((v,i)=>{text(v,x,y,7,true,accent);x+=cw[i]});y+=9;
 rows2.forEach(([k,v])=>{if(y>H-65){doc.addPage();y=22}x=m;[k.replace(/_/g," "),v.score??"—",v.maximum??"—",v.source_rule??"—"].forEach((value,i)=>{text(value,x,y,7,false,ink);x+=cw[i]});doc.setDrawColor(...line);doc.line(m,y+3,W-m,y+3);y+=9});
 y+=8;y=section("Traditional Chart Indicators",y);
 const people=[["Bride",result.bride],["Groom",result.groom]];
 people.forEach(([label,p])=>{text(label,m,y,8,true,accent);text("Moon sign: "+(p?.sign||"—"),m+25,y,8);text("Nakshatra: "+(p?.nakshatra?.name||p?.nakshatra||"—")+(p?.nakshatra?.pada?" • Pada "+p.nakshatra.pada:""),m+90,y,8);y+=8});
 y+=5;y=section("Important Guidance",y);
 doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(...ink);doc.text(wrap(note,W-2*m),m,y,{lineHeightFactor:1.25});y+=Math.ceil(wrap(note,W-2*m).length*4.5)+5;
 const extra="The score follows the classical 36-point Ashtakoota method. A score alone does not determine relationship success. Detailed chart review, Manglik considerations, dosha cancellation, family traditions and individual circumstances may also be considered by a qualified astrologer.";
 doc.setFontSize(7.5);doc.setTextColor(...muted);doc.text(wrap(extra,W-2*m),m,y,{lineHeightFactor:1.2});
 for(let i=1;i<=doc.getNumberOfPages();i++){doc.setPage(i);footer()}
 const safe=(data.bride.name||"Bride").replace(/[^a-z0-9_-]+/gi,"-")+"-"+(data.groom.name||"Groom").replace(/[^a-z0-9_-]+/gi,"-");
 doc.save("Siddha-Astro-Marriage-Matching-"+safe+".pdf");
}
document.addEventListener("DOMContentLoaded",()=>{
 people.forEach(setupPerson);
 $("matchCalculateBtn")?.addEventListener("click",calculate);
});
window.SiddhaMarriageMatch={lastData:null,downloadPdf};
})();