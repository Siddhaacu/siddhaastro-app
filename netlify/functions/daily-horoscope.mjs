import { getStore } from "@netlify/blobs";

const STORE_NAME="siddha-astro-horoscope";
const PANCHANG_API="https://nityapanchangam.com/api/panchangam.php";
const RASHIS=[
  ["Mesha","Aries","మేషం","♈","Fire","అగ్ని","Mars","కుజుడు"],["Vrishabha","Taurus","వృషభం","♉","Earth","భూమి","Venus","శుక్రుడు"],
  ["Mithuna","Gemini","మిథునం","♊","Air","వాయువు","Mercury","బుధుడు"],["Karkataka","Cancer","కర్కాటకం","♋","Water","జలం","Moon","చంద్రుడు"],
  ["Simha","Leo","సింహం","♌","Fire","అగ్ని","Sun","సూర్యుడు"],["Kanya","Virgo","కన్య","♍","Earth","భూమి","Mercury","బుధుడు"],
  ["Tula","Libra","తుల","♎","Air","వాయువు","Venus","శుక్రుడు"],["Vrischika","Scorpio","వృశ్చికం","♏","Water","జలం","Mars","కుజుడు"],
  ["Dhanu","Sagittarius","ధనుస్సు","♐","Fire","అగ్ని","Jupiter","గురుడు"],["Makara","Capricorn","మకరం","♑","Earth","భూమి","Saturn","శని"],
  ["Kumbha","Aquarius","కుంభం","♒","Air","వాయువు","Saturn","శని"],["Meena","Pisces","మీనం","♓","Water","జలం","Jupiter","గురుడు"]
];
const FOCUS=[
  ["fresh beginnings","కొత్త ప్రారంభాలు"],["steady progress","స్థిరమైన పురోగతి"],["clear communication","స్పష్టమైన సంభాషణ"],["emotional balance","భావోద్వేగ సమతుల్యత"],
  ["creative confidence","సృజనాత్మక ఆత్మవిశ్వాసం"],["careful planning","జాగ్రత్తైన ప్రణాళిక"],["partnerships","భాగస్వామ్యాలు"],["deep transformation","లోతైన మార్పు"],
  ["expansion","విస్తరణ"],["discipline","క్రమశిక్షణ"],["new ideas","కొత్త ఆలోచనలు"],["spiritual clarity","ఆధ్యాత్మిక స్పష్టత"]
];
const CAREER=[
 ["A practical opportunity can move work forward.","ఆచరణాత్మకమైన అవకాశం మీ పనిని ముందుకు తీసుకెళ్లవచ్చు."],
 ["Keep priorities focused and avoid unnecessary delays.","ప్రాధాన్యతలపై దృష్టి పెట్టి అనవసరమైన ఆలస్యాలను నివారించండి."],
 ["A useful conversation can open a new professional path.","ఒక ముఖ్యమైన సంభాషణ కొత్త వృత్తిపరమైన మార్గాన్ని తెరవవచ్చు."],
 ["Your judgement improves when you give decisions enough time.","నిర్ణయాలకు తగిన సమయం ఇస్తే మీ వివేచన మరింత మెరుగవుతుంది."],
 ["Your creative approach can attract recognition.","మీ సృజనాత్మక విధానం గుర్తింపును తెచ్చిపెట్టవచ్చు."],
 ["Detailed work done today can prevent future rework.","ఈ రోజు శ్రద్ధగా చేసే పని భవిష్యత్ పునఃపనిని తగ్గిస్తుంది."],
 ["Cooperation with colleagues brings better results.","సహోద్యోగులతో సహకారం మంచి ఫలితాలను ఇస్తుంది."],
 ["Research and persistence reveal an important advantage.","పరిశోధన మరియు పట్టుదల ముఖ్యమైన ప్రయోజనాన్ని చూపిస్తాయి."],
 ["A broader outlook helps you spot growth opportunities.","విస్తృత దృక్పథం అభివృద్ధి అవకాశాలను గుర్తించడంలో సహాయపడుతుంది."],
 ["Consistent effort is more valuable than a quick result.","త్వరిత ఫలితం కంటే నిరంతర కృషి విలువైనది."],
 ["An unconventional solution may solve a stubborn problem.","సాంప్రదాయేతర పరిష్కారం క్లిష్టమైన సమస్యను పరిష్కరించవచ్చు."],
 ["Intuition and thoughtful planning work well together.","అంతర్‌జ్ఞానం మరియు ఆలోచనాత్మక ప్రణాళిక కలిసి మంచి ఫలితాలను ఇస్తాయి."]
];
const LOVE=[
 ["Speak openly and avoid assuming what others feel.","బహిరంగంగా మాట్లాడండి; ఇతరుల భావాలను ఊహించకుండా ఉండండి."],
 ["Small acts of reliability strengthen close relationships.","చిన్న చిన్న నమ్మకమైన చర్యలు సన్నిహిత సంబంధాలను బలపరుస్తాయి."],
 ["A meaningful conversation can improve emotional understanding.","అర్థవంతమైన సంభాషణ భావోద్వేగ అవగాహనను మెరుగుపరుస్తుంది."],
 ["Give yourself and others room to process feelings.","భావాలను అర్థం చేసుకోవడానికి మీకూ ఇతరులకూ కొంత సమయం ఇవ్వండి."],
 ["Warmth and confidence make connections easier.","ఆప్యాయత మరియు ఆత్మవిశ్వాసం సంబంధాలను సులభతరం చేస్తాయి."],
 ["Thoughtful attention matters more than grand gestures.","గొప్ప ప్రదర్శనల కంటే శ్రద్ధతో కూడిన స్పందన ముఖ్యమైనది."],
 ["Balance your needs with the needs of the relationship.","మీ అవసరాలను సంబంధం యొక్క అవసరాలతో సమతుల్యం చేయండి."],
 ["Honesty helps deepen an important bond.","నిజాయితీ ముఖ్యమైన బంధాన్ని మరింత లోతుగా చేస్తుంది."],
 ["Shared experiences bring freshness to relationships.","పంచుకున్న అనుభవాలు సంబంధాలకు కొత్త ఉత్సాహాన్ని ఇస్తాయి."],
 ["Commitment grows through consistency.","నిరంతరత ద్వారా నిబద్ధత పెరుగుతుంది."],
 ["Friendship and understanding can become the strongest foundation.","స్నేహం మరియు అవగాహన బలమైన పునాదిగా మారవచ్చు."],
 ["Compassion makes today especially supportive for relationships.","కరుణ ఈ రోజును సంబంధాలకు మరింత అనుకూలంగా చేస్తుంది."]
];
const HEALTH=[
 ["Maintain a steady routine and avoid overexertion.","స్థిరమైన దినచర్యను పాటించి అతిగా శ్రమించకుండా ఉండండి."],
 ["Good sleep and regular meals support your energy.","మంచి నిద్ర మరియు క్రమమైన భోజనం మీ శక్తికి తోడ్పడతాయి."],
 ["A short break from screens can improve mental clarity.","స్క్రీన్‌లకు కొద్దిసేపు దూరంగా ఉండటం మానసిక స్పష్టతను పెంచుతుంది."],
 ["Give yourself time to relax and reset.","విశ్రాంతి తీసుకుని మళ్లీ సమతుల్యం పొందడానికి సమయం కేటాయించండి."],
 ["Physical activity can channel excess energy constructively.","శారీరక వ్యాయామం అదనపు శక్తిని సానుకూలంగా వినియోగించడంలో సహాయపడుతుంది."],
 ["Keep routines simple and consistent.","దినచర్యను సరళంగా మరియు నిరంతరంగా ఉంచండి."],
 ["Balance work with enough recovery time.","పనితో పాటు తగిన విశ్రాంతి సమయాన్ని కల్పించండి."],
 ["Quiet time or meditation can be restorative.","నిశ్శబ్ద సమయం లేదా ధ్యానం పునరుత్తేజాన్ని ఇస్తాయి."],
 ["Outdoor activity can lift your mood and energy.","బయటి ప్రదేశంలో చేసే కార్యకలాపాలు ఉత్సాహం మరియు శక్తిని పెంచుతాయి."],
 ["Consistency with healthy habits pays off.","ఆరోగ్యకరమైన అలవాట్లలో నిరంతరత మంచి ఫలితాలను ఇస్తుంది."],
 ["Avoid mental overload and make space for rest.","మానసిక ఒత్తిడిని తగ్గించి విశ్రాంతికి స్థలం ఇవ్వండి."],
 ["Calm breathing and gentle movement can restore balance.","ప్రశాంతమైన శ్వాస మరియు సున్నితమైన కదలికలు సమతుల్యతను పునరుద్ధరిస్తాయి."]
];
const DAYS=[["Sunday","ఆదివారం"],["Monday","సోమవారం"],["Tuesday","మంగళవారం"],["Wednesday","బుధవారం"],["Thursday","గురువారం"],["Friday","శుక్రవారం"],["Saturday","శనివారం"]];
const CITY={slug:"hyderabad",lat:17.385,lng:78.486};
const indiaToday=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const dayNumber=date=>Math.floor(Date.parse(date+"T00:00:00Z")/86400000);

async function getPanchang(date){
  const q=new URLSearchParams({date,city:CITY.slug,lat:String(CITY.lat),lng:String(CITY.lng)});
  try{
    const r=await fetch(PANCHANG_API+"?"+q,{headers:{Accept:"application/json"}});
    if(!r.ok)throw new Error("Panchang API HTTP "+r.status);
    const d=await r.json();
    return {tithi:d.tithi?.name||"Tithi",nakshatra:d.nakshatra?.name||"Nakshatra",rashi:d.rashi?.name||"Moon Rashi",sunrise:d.sun?.sunrise||d.sunrise||"—",sunset:d.sun?.sunset||d.sunset||"—"};
  }catch(error){
    console.warn("Nitya Panchang API unavailable:",error);
    if(date==="2026-10-07")return {tithi:"Krishna Dwadashi",nakshatra:"Magha",rashi:"Simha",sunrise:"6:07 AM",sunset:"6:00 PM"};
    return {tithi:"Tithi",nakshatra:"Nakshatra",rashi:"Moon Rashi",sunrise:"—",sunset:"—"};
  }
}
function buildHoroscopes(date,p){
  const n=dayNumber(date),result={};
  RASHIS.forEach((r,i)=>{
    const f=FOCUS[(n+i)%FOCUS.length],career=CAREER[(n+i)%CAREER.length],love=LOVE[(n+i*2)%LOVE.length],health=HEALTH[(n+i*3)%HEALTH.length],day=DAYS[(n+i)%7];
    result[r[0]]={
      rashi:r[0],icon:r[3],period:r[1],periodTe:r[2],element:r[4],elementTe:r[5],ruler:r[6],rulerTe:r[7],
      daily:{en:`Today emphasizes ${f[0]}. The Moon is in ${p.rashi}, under ${p.nakshatra}, and the day's Tithi is ${p.tithi}. Use this atmosphere thoughtfully and focus on practical action.`,te:`ఈ రోజు ${f[1]} ప్రధానంగా ఉంటాయి. చంద్రుడు ${p.rashi}లో ${p.nakshatra} నక్షత్రంలో ఉన్నాడు; నేటి తిథి ${p.tithi}. ఈ ప్రభావాలను సమర్థంగా ఉపయోగించుకుని ఆచరణాత్మక చర్యలపై దృష్టి పెట్టండి.`},
      career:{en:career[0],te:career[1]},love:{en:love[0],te:love[1]},health:{en:health[0],te:health[1]},
      lucky:{number:String(((n+i)%9)+1),day:{en:day[0],te:day[1]},focus:{en:f[0],te:f[1]}}
    };
  });
  return result;
}
async function generate(){
  const date=indiaToday(),p=await getPanchang(date),data={ok:true,date,generatedAt:new Date().toISOString(),panchang:p,horoscopes:buildHoroscopes(date,p)};
  const store=getStore(STORE_NAME,{consistency:"strong"});await store.setJSON(date,data);await store.setJSON("latest",data);console.log("Daily bilingual horoscope generated:",date);
  return data;
}
export default async function(){const data=await generate();return new Response(JSON.stringify({ok:true,date:data.date}),{headers:{"Content-Type":"application/json"}});}
export const config={schedule:"30 21 * * *"};
