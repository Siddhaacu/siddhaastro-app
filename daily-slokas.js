/* Siddha Astro daily slokas
   Add more verified entries to each collection as needed.
*/
const DAILY_SLOKAS = [
  {
    collection: 'Soundarya Lahari', number: 1,
    telugu: 'శివః శక్త్యా యుక్తో యది భవతి శక్తః ప్రభవితుం\nన చేదేవం దేవో న ఖలు కుశలః స్పందితుమపి ।\nఅతస్త్వామారాధ్యాం హరిహరవిరించాదిభిరపి\nప్రణంతుం స్తోతుం వా కథమకృతపుణ్యః ప్రభవతి ॥',
    english: 'Shivah shaktya yukto yadi bhavati shaktah prabhavitum\nNa chedevam devo na khalu kushalah spanditum api\nAtastvam aradhyam harihara-virinchadibhir api\nPranantum stotum va katham akrita-punyah prabhavati'
  },
  {
    collection: 'Sivananda Lahari', number: 1,
    telugu: 'కలాభ్యాం చూడాలంకృత శశికలాభ్యాం నిజతపః\nఫలాభ్యాం భక్తేషు ప్రకటిత ఫలాభ్యాం భవతు మే ।\nశివాభ్యామస్తోక త్రిభువన శివాభ్యాం హృది పునః\nభవాభ్యామానంద స్ఫురదనుభవాభ్యాం నతిరియమ్ ॥',
    english: 'Kalabhyam chudalamkrita-shashikalabhyam nija-tapah\nPhalabhyam bhakteshu prakatita-phalabhyam bhavatu me\nShivabhyam astoka-tribhuvana-shivabhyam hridi punah\nBhavabhyam ananda-sphurad-anubhavabhyam natir iyam'
  },
  {
    collection: 'Lalitha Sahasranamam', number: 1,
    telugu: 'శ్రీమాతా శ్రీమహారాజ్ఞీ శ్రీమత్సింహాసనేశ్వరీ ।\nచిదగ్ని కుండసంభూతా దేవకార్య సముద్యతా ॥',
    english: 'Shrimata Shri Maharajni Shrimatsimhasaneshvari\nChidagni-kunda-sambhuta Devakarya-samudyata'
  },
  {
    collection: 'Vishnu Sahasranamam', number: 1,
    telugu: 'విశ్వం విష్ణుర్వషట్కారో భూతభవ్యభవత్ప్రభుః ।\nభూతకృద్భూతభృద్భావో భూతాత్మా భూతభావనః ॥',
    english: 'Vishvam Vishnur Vashatkaro Bhuta-bhavya-bhavat-prabhuh\nBhuta-krit Bhuta-bhrit Bhavo Bhutatma Bhuta-bhavanah'
  }
];

function getIndiaDateKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
}

function getTodaySloka() {
  const epoch = Date.UTC(2026, 0, 1);
  const today = new Date(`${getIndiaDateKey()}T00:00:00+05:30`).getTime();
  const dayIndex = Math.floor((today - epoch) / 86400000);
  return DAILY_SLOKAS[((dayIndex % DAILY_SLOKAS.length) + DAILY_SLOKAS.length) % DAILY_SLOKAS.length];
}

function renderDailySloka() {
  const sloka = getTodaySloka();
  const collection = document.getElementById('slokaCollection');
  const number = document.getElementById('slokaNumber');
  const telugu = document.getElementById('slokaTelugu');
  const english = document.getElementById('slokaEnglish');
  if (!collection || !number || !telugu || !english) return;
  collection.textContent = sloka.collection;
  number.textContent = `Sloka ${sloka.number}`;
  telugu.textContent = sloka.telugu;
  english.textContent = sloka.english;
}

document.addEventListener('DOMContentLoaded', () => {
  renderDailySloka();
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  setTimeout(() => {
    renderDailySloka();
    setInterval(renderDailySloka, 86400000);
  }, nextMidnight - now);
});
